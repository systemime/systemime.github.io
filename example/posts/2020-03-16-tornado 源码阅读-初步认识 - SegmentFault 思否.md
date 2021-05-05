---
title: tornado 源码阅读-初步认识 - SegmentFault 思否
subtitle: 文章暂存
author: systemime
date: 2020-03-16
header_img: /img/in-post/2020-10-29/header.jpg
catalog: true
tags:
  - python
---

欢迎来到我的世界.

<!-- more -->

## 序言

    最近闲暇无事,阅读了一下tornado的源码,对整体的结构有了初步认识,与大家分享
    不知道为什么右边的目录一直出不来,非常不舒服.
    不如移步到oschina吧....[http://my.oschina.net/abc2001x/blog/476349][1] 

## ioloop

    `ioloop`是`tornado`的核心模块,也是个调度模块,各种异步事件都是由他调度的,所以必须弄清他的执行逻辑 

### 源码分析

    而`ioloop`的核心部分则是 `while True`这个循环内部的逻辑,贴上他的代码如下 

     def start(self):
            if self._running:
                raise RuntimeError("IOLoop is already running")
            self._setup_logging()
            if self._stopped:
                self._stopped = False
                return
            old_current = getattr(IOLoop._current, "instance", None)
            IOLoop._current.instance = self
            self._thread_ident = thread.get_ident()
            self._running = True

            old_wakeup_fd = None
            if hasattr(signal, 'set_wakeup_fd') and os.name == 'posix':

                try:
                    old_wakeup_fd = signal.set_wakeup_fd(self._waker.write_fileno())
                    if old_wakeup_fd != -1:

                        signal.set_wakeup_fd(old_wakeup_fd)
                        old_wakeup_fd = None
                except ValueError:

                    old_wakeup_fd = None

            try:
                while True:

                    with self._callback_lock:
                        callbacks = self._callbacks
                        self._callbacks = []

                    due_timeouts = []

                    if self._timeouts:
                        now = self.time()
                        while self._timeouts:
                            if self._timeouts[0].callback is None:

                                heapq.heappop(self._timeouts)
                                self._cancellations -= 1
                            elif self._timeouts[0].deadline <= now:
                                due_timeouts.append(heapq.heappop(self._timeouts))
                            else:
                                break
                        if (self._cancellations > 512
                                and self._cancellations > (len(self._timeouts) >> 1)):
                            self._cancellations = 0
                            self._timeouts = [x for x in self._timeouts
                                              if x.callback is not None]
                            heapq.heapify(self._timeouts)

                    for callback in callbacks:
                        self._run_callback(callback)
                    for timeout in due_timeouts:
                        if timeout.callback is not None:
                            self._run_callback(timeout.callback)

                    callbacks = callback = due_timeouts = timeout = None

                    if self._callbacks:

                        poll_timeout = 0.0
                    elif self._timeouts:

                        poll_timeout = self._timeouts[0].deadline - self.time()
                        poll_timeout = max(0, min(poll_timeout, _POLL_TIMEOUT))
                    else:

                        poll_timeout = _POLL_TIMEOUT

                    if not self._running:
                        break

                    if self._blocking_signal_threshold is not None:

                        signal.setitimer(signal.ITIMER_REAL, 0, 0)

                    try:
                        event_pairs = self._impl.poll(poll_timeout)
                    except Exception as e:

                        if errno_from_exception(e) == errno.EINTR:
                            continue
                        else:
                            raise

                    if self._blocking_signal_threshold is not None:
                        signal.setitimer(signal.ITIMER_REAL,
                                         self._blocking_signal_threshold, 0)

                    self._events.update(event_pairs)
                    while self._events:
                        fd, events = self._events.popitem()
                        try:
                            fd_obj, handler_func = self._handlers[fd]
                            handler_func(fd_obj, events)
                        except (OSError, IOError) as e:
                            if errno_from_exception(e) == errno.EPIPE:

                                pass
                            else:
                                self.handle_callback_exception(self._handlers.get(fd))
                        except Exception:
                            self.handle_callback_exception(self._handlers.get(fd))
                    fd_obj = handler_func = None

            finally:

                self._stopped = False
                if self._blocking_signal_threshold is not None:
                    signal.setitimer(signal.ITIMER_REAL, 0, 0)
                IOLoop._current.instance = old_current
                if old_wakeup_fd is not None:
                    signal.set_wakeup_fd(old_wakeup_fd) 

    除去注释,代码其实没多少行. 由while 内部代码可以看出ioloop主要由三部分组成: 

### 1. 回调 callbacks

他是`ioloop`回调的基础部分, 通过`IOLoop.instance().add_callback()`添加到`self._callbacks`  
他们将在每一次`loop`中被运行.

主要用途是将逻辑分块, 在适合时机将包装好的`callbac`k 添加到`self._callbacks`让其执行.

例如`ioloop`中的`add_future`

    def add_future(self, future, callback):
            """Schedules a callback on the ``IOLoop`` when the given
            `.Future` is finished.

            The callback is invoked with one argument, the
            `.Future`.
            """
            assert is_future(future)
            callback = stack_context.wrap(callback)
            future.add_done_callback(
                lambda future: self.add_callback(callback, future)) 

`future`对象得到`result`的时候会调用`future.add_done_callback`添加的`callback`, 再将其转至`ioloop`执行

### 2. 定时器 due_timeouts

这是定时器, 在指定的事件执行`callback`.  
跟 1 中的`callback`类似, 通过`IOLoop.instance().add_callback`

在每一次循环, 会计算`timeouts`回调列表里的事件, 运行已到期的`callback`.  
当然不是无节操的循环.

因为`poll`操作会阻塞到有`io`操作发生, 所以只要计算最近的`timeout`,  
然后用这个时间作为`self._impl.poll(poll_timeout)` 的 `poll_timeout` ,  
就可以达到按时运行了

但是, 假设`poll_timeout`的时间很大时,`self._impl.poll`一直在堵塞中 (没有 io 事件, 但在处理某一个`io`事件),  
那添加刚才 1 中的`callback`不是要等很久才会被运行吗? 答案当然是不会.  
`ioloop`中有个`waker`对象, 他是由两个`fd`组成, 一个读一个写.  
`ioloop`在初始化的时候把 waker 绑定到`epoll`里了,`add_callback`时会触发 waker 的读写.  
这样`ioloop`就会在`poll`中被唤醒了, 接着就可以及时处理`timeout callback`了

用这样的方式也可以自己封装一个小的定时器功能玩玩

### 3.io 事件的 event loop

处理`epoll`事件的功能  
通过`IOLoop.instance().add_handler(fd, handler, events)`绑定`fd event`的处理事件  
在`httpserver.listen`的代码内,  
`netutil.py`中的`netutil.py`的`add_accept_handler`绑定`accept handler`处理客户端接入的逻辑

如法炮制, 其他的 io 事件也这样绑定, 业务逻辑的分块交由`ioloop`的`callback`和`future`处理

关于`epoll`的用法的内容. 详情见我第一篇[文章](http://segmentfault.com/a/1190000002965546?_ea=251087)吧, 哈哈

### 总结

ioloop 由`callback`(业务分块), `timeout callback`(定时任务) `io event`(io 传输和解析) 三块组成, 互相配合完成异步的功能, 构建`gen`,`httpclient`,`iostream`等功能

串联大致的流程是,`tornado` 绑定 io event, 处理 io 传输解析, 传输完成后 (结合 Future) 回调 (callback) 业务处理的逻辑和一些固定操作 . 定时器则是较为独立的模块

## Futrue

个人认为`Future`是`tornado`仅此`ioloop`重要的模块, 他贯穿全文, 所有异步操作都有他的身影  
顾名思义, 他主要是关注日后要做的事, 类似`jquery`的`Deferred`吧

一般的用法是通过`ioloop`的`add_future`定义`future`的`done callback`,  
当`future`被`set_result`的时候,`future`的`done callback`就会被调用.  
从而完成`Future`的功能.

具体可以参考`gen.coroutine`的实现, 本文后面也会讲到

他的组成不复杂, 只有几个重要的方法  
最重要的是 `add_done_callback` , `set_result`

`tornado`用`Future`和`ioloop`,`yield`实现了`gen.coroutine`

### 1. add_done_callback

跟`ioloop`的`callback`类似 , 存储事件完成后的`callback`在`self._callbacks`里

    def add_done_callback(self, fn):
            if self._done:
                fn(self)
            else:
                self._callbacks.append(fn) 

### 2.set_result

设置事件的结果, 并运行之前存储好的`callback`

    def set_result(self, result):
            self._result = result
            self._set_done()

    def _set_done(self):
            self._done = True
            for cb in self._callbacks:
                try:
                    cb(self)
                except Exception:
                    app_log.exception('Exception in callback %r for %r',
                                      cb, self)
            self._callbacks = None 

为了验证之前所说的, 上一段测试代码

    #! /usr/bin/env python
    #coding=utf-8

    import tornado.web
    import tornado.ioloop

    from tornado.gen import coroutine
    from tornado.concurrent import Future


    def test():
        def pp(s):
            print s

        future = Future()
        iol = tornado.ioloop.IOLoop.instance()

        print 'init future %s'%future

        iol.add_future(future, lambda f: pp('ioloop callback after future done,future is %s'%f))

        #模拟io延迟操作
        iol.add_timeout(iol.time()+5,lambda:future.set_result('set future is done'))

        print 'init complete'
        tornado.ioloop.IOLoop.instance().start()

    if __name__ == "__main__":
        test() 

运行结果:

![](https://segmentfault.com/img/bVmDiC)

## gen.coroutine

接着继续延伸, 看看`coroutine`的实现  
`gen.coroutine`实现的功能其实是将原来的`callback`的写法, 用`yield`的写法代替. 即以 yield 为分界, 将代码分成两部分.  
如:

     import tornado.ioloop
    from tornado.gen import coroutine
    from tornado.httpclient import AsyncHTTPClient

    @coroutine
    def cotest():
        client = AsyncHTTPClient()
        res = yield client.fetch("http://www.segmentfault.com/")
        print res

    if __name__ == "__main__":
        f = cotest()    
        print f 
        tornado.ioloop.IOLoop.instance().start() 

运行结果:

![](https://segmentfault.com/img/bVmDjU)

### 源码分析

接下来分析下`coroutine`的实现

    def _make_coroutine_wrapper(func, replace_callback):

     @functools.wraps(func)
        def wrapper(*args, **kwargs):
            future = TracebackFuture()

            if replace_callback and 'callback' in kwargs:
                callback = kwargs.pop('callback')
                IOLoop.current().add_future(
                    future, lambda future: callback(future.result()))

            try:
                result = func(*args, **kwargs)
            except (Return, StopIteration) as e:
                result = getattr(e, 'value', None)
            except Exception:
                future.set_exc_info(sys.exc_info())
                return future
            else:
                if isinstance(result, types.GeneratorType):
                    try:
                        orig_stack_contexts = stack_context._state.contexts
                        yielded = next(result)
                        if stack_context._state.contexts is not orig_stack_contexts:
                            yielded = TracebackFuture()
                            yielded.set_exception(
                                stack_context.StackContextInconsistentError(
                                    'stack_context inconsistency (probably caused '
                                    'by yield within a "with StackContext" block)'))
                    except (StopIteration, Return) as e:
                        future.set_result(getattr(e, 'value', None))
                    except Exception:
                        future.set_exc_info(sys.exc_info())
                    else:
                        Runner(result, future, yielded)
                    try:
                        return future
                    finally:
                        future = None
            future.set_result(result)
            return future
        return wrapper 

如源码所示,`func`运行的结果是`GeneratorType` ,`yielded = next(result)`,  
运行至原函数的 yield 位置, 返回的是原函数`func`内部 `yield` `右边`返回的对象 (必须是`Future`或`Future`的`list`) 给`yielded`.  
经过`Runner(result, future, yielded)` 对 yielded 进行处理.  
在此就 贴出 Runner 的代码了.  
Runner 初始化过程, 调用`handle_yield`, 查看`yielded`是否已`done`了, 否则`add_future`运行`Runner`的`run`方法,  
`run`方法中如果`yielded`对象已完成, 用对它的`gen`调用`send`, 发送完成的结果.  
所以`yielded`在什么地方被`set_result`非常重要,  
当被`set_result`的时候, 才会`send`结果给原`func`, 完成整个异步操作

详情可以查看 tornado 中重要的对象 iostream, 源码中 iostream 的 \_handle_connect, 如此设置了连接的 result.

    def _handle_connect(self):
            err = self.socket.getsockopt(socket.SOL_SOCKET, socket.SO_ERROR)
            if err != 0:
                self.error = socket.error(err, os.strerror(err))
                if self._connect_future is None:
                    gen_log.warning("Connect error on fd %s: %s",
                                    self.socket.fileno(), errno.errorcode[err])
                self.close()
                return
            if self._connect_callback is not None:
                callback = self._connect_callback
                self._connect_callback = None
                self._run_callback(callback)
            if self._connect_future is not None:
                future = self._connect_future
                self._connect_future = None
                future.set_result(self)
            self._connecting = False 

最后贴上一个简单的测试代码, 演示 coroutine,future 的用法

    import tornado.ioloop
    from tornado.gen import coroutine
    from tornado.concurrent import Future

    @coroutine
    def asyn_sum(a, b):
        print("begin calculate:sum %d+%d"%(a,b))
        future = Future()
        future2 = Future()
        iol = tornado.ioloop.IOLoop.instance()

        print future

        def callback(a, b):
            print("calculating the sum of %d+%d:"%(a,b))
            future.set_result(a+b)

            iol.add_timeout(iol.time()+3,lambda f:f.set_result(None),future2)
        iol.add_timeout(iol.time()+3,callback, a, b)

        result = yield future

        print("after yielded")
        print("the %d+%d=%d"%(a, b, result))

        yield future2

        print 'after future2'

    def main():
        f =  asyn_sum(2,3)

        print ''
        print f
        tornado.ioloop.IOLoop.instance().start()

    if __name__ == "__main__":
        main() 

运行结果:

![](https://segmentfault.com/img/bVmDo4)

为什么代码中个 yield 都起作用了? 因为`Runner.run`里, 最后继续用`handle_yield`处理了`send`后返回的`yielded`对象, 意思是`func`里可以有 n 干个`yield`操作

    if not self.handle_yield(yielded):
                        return 

### 总结

至此, 已完成 tornado 中重要的几个模块的流程, 其他模块也是由此而来. 写了这么多, 越写越卡, 就到此为止先吧,

## 最后的最后的最后

啊~~~~~~好想有份`工作` 和`女朋友`啊~~\~\~~ 
 [https://segmentfault.com/a/1190000002971992](https://segmentfault.com/a/1190000002971992) 
 [https://segmentfault.com/a/1190000002971992](https://segmentfault.com/a/1190000002971992)
