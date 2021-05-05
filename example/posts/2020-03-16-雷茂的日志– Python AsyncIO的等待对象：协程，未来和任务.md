---
title: 雷茂的日志– Python AsyncIO的等待对象：协程，未来和任务
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

### 介绍

Python`asyncio`是高效单线程并发应用程序的库。在上一篇博客文章[“Python AsyncIO 事件循环” 中](https://leimao.github.io/blog/Python-AsyncIO-Event-Loop/)，我们`asyncio`通过查看 Python 源代码了解了 Python 中的事件循环。这似乎对理解 Python 的`asyncio`工作原理很有效。

在这篇博客文章中，我想进一步走一步，并讨论了三个关键的机制`asyncio`awaitables，其中包括`Coroutine`，`Future`，和`Task`，通过在 Python 源代码重新寻找。

### 协程

从 Python 3.5 开始，`coroutine`使用定义函数，`async def`并`Coroutine`通过调用`coroutine`函数创建对象。的抽象类[`Coroutine`](https://github.com/python/cpython/blob/3.8/Lib/_collections_abc.py#L114)如下。它没有方法重载，因为派生的类和方法重载是由 Python 解释器为`coroutine`使用定义的函数生成的`async def`。`Coroutine`上课的关键方法是`send`。它试图模仿蹦床的行为。

    class Coroutine(Awaitable):
        __slots__ = ()
        @abstractmethod
        def send(self, value):
            """Send a value into the coroutine.
            Return next yielded value or raise StopIteration.
            """
            raise StopIteration
        @abstractmethod
        def throw(self, typ, val=None, tb=None):
            """Raise an exception in the coroutine.
            Return next yielded value or raise StopIteration.
            """
            if val is None:
                if tb is None:
                    raise typ
                val = typ()
            if tb is not None:
                val = val.with_traceback(tb)
            raise val
        def close(self):
            """Raise GeneratorExit inside coroutine.
            """
            try:
                self.throw(GeneratorExit)
            except (GeneratorExit, StopIteration):
                pass
            else:
                raise RuntimeError("coroutine ignored GeneratorExit")
        @classmethod
        def __subclasshook__(cls, C):
            if cls is Coroutine:
                return _check_methods(C, '__await__', 'send', 'throw', 'close')
            return NotImplemented 

“幸运的是”，Python`asyncio` `coroutine`曾经`@asyncio.coroutine`在 Python 3.4 中的 Python 生成器上使用装饰器实现。希望`coroutine`Python 3.5 + 中的逻辑类似于`coroutine`Python 3.4 中`coroutine`在调用时产生 sub 的逻辑。

A typical `coroutine` could be implemented using a Python generator just like the follows.

    import asyncio
    import datetime
    @asyncio.coroutine
    def display_date(loop):
        end_time = loop.time() + 5.0
        while True:
            print(datetime.datetime.now())
            if (loop.time() + 1.0) >= end_time:
                break
            yield from asyncio.sleep(1)
    loop = asyncio.get_event_loop()
    # Blocking call which returns when the display_date() coroutine is done loop.run_until_complete(display_date(loop))
    loop.close() 

The [`@asyncio.coroutine`](https://github.com/python/cpython/blob/master/Lib/asyncio/coroutines.py) decorator implementation is as follows.

    def coroutine(func):
        """Decorator to mark coroutines.
        If the coroutine is not yielded from before it is destroyed,
        an error message is logged.
        """
        warnings.warn('"@coroutine" decorator is deprecated since Python 3.8, use "async def" instead',
                      DeprecationWarning,
                      stacklevel=2)
        if inspect.iscoroutinefunction(func):
            # In Python 3.5 that's all we need to do for coroutines
            # defined with "async def".
            return func
        if inspect.isgeneratorfunction(func):
            coro = func
        else:
            @functools.wraps(func)
            def coro(*args, **kw):
                res = func(*args, **kw)
                if (base_futures.isfuture(res) or inspect.isgenerator(res) or
                        isinstance(res, CoroWrapper)):
                    res = yield from res
                else:
                    # If 'res' is an awaitable, run it.
                    try:
                        await_meth = res.__await__
                    except AttributeError:
                        pass
                    else:
                        if isinstance(res, collections.abc.Awaitable):
                            res = yield from await_meth()
                return res
        coro = types.coroutine(coro)
        if not _DEBUG:
            wrapper = coro
        else:
            @functools.wraps(func)
            def wrapper(*args, **kwds):
                w = CoroWrapper(coro(*args, **kwds), func=func)
                if w._source_traceback:
                    del w._source_traceback[-1]
                # Python < 3.5 does not implement __qualname__
                # on generator objects, so we set it manually.
                # We use getattr as some callables (such as
                # functools.partial may lack __qualname__).
                w.__name__ = getattr(func, '__name__', None)
                w.__qualname__ = getattr(func, '__qualname__', None)
                return w
        wrapper._is_coroutine = _is_coroutine  # For iscoroutinefunction().
        return wrapper 

Without looking into the details, this `@asyncio.coroutine` decorator almost does not change the generator at all, since most likely `wrapper` `coro`.

When we tried to run `coroutine` with [loop.run_until_complete](https://github.com/python/cpython/blob/3.8/Lib/asyncio/base_events.py#L580), we see from the comment that if the argument is a `coroutine` then it would be converted to a `Task` in the first place, and `loop.run_until_complete` is actually scheduling `Task`s. So we would look into `Task` shortly.

### Future

`Future` has closed relationship with `Task`, so let’s look at `Future` first.

[`Future`](https://github.com/python/cpython/blob/3.8/Lib/asyncio/futures.py#L29) use has an event loop. By default, it is the event loop in the main thread.

    class Future:
        """This class is *almost* compatible with concurrent.futures.Future.
        Differences:
        - This class is not thread-safe.
        - result() and exception() do not take a timeout argument and
          raise an exception when the future isn't done yet.
        - Callbacks registered with add_done_callback() are always called
          via the event loop's call_soon().
        - This class is not compatible with the wait() and as_completed()
          methods in the concurrent.futures package.
        (In Python 3.4 or later we may be able to unify the implementations.)
        """
        # Class variables serving as defaults for instance variables.
        _state = _PENDING
        _result = None
        _exception = None
        _loop = None
        _source_traceback = None
        # This field is used for a dual purpose:
        # - Its presence is a marker to declare that a class implements
        #   the Future protocol (i.e. is intended to be duck-type compatible).
        #   The value must also be not-None, to enable a subclass to declare
        #   that it is not compatible by setting this to None.
        # - It is set by __iter__() below so that Task._step() can tell
        #   the difference between
        #   `await Future()` or`yield from Future()` (correct) vs.
        #   `yield Future()` (incorrect).
        _asyncio_future_blocking = False
        __log_traceback = False
        def __init__(self, *, loop=None):
            """Initialize the future.
            The optional event_loop argument allows explicitly setting the event
            loop object used by the future. If it's not provided, the future uses
            the default event loop.
            """
            if loop is None:
                self._loop = events.get_event_loop()
            else:
                self._loop = loop
            self._callbacks = []
            if self._loop.get_debug():
                self._source_traceback = format_helpers.extract_stack(
                    sys._getframe(1))
        _repr_info = base_futures._future_repr_info 

The key method of `Future` is `future.set_result`. Let’s check what will happen if we call [`future.set_result`](https://github.com/python/cpython/blob/3.8/Lib/asyncio/futures.py#L227).

     def set_result(self, result):
            """Mark the future done and set its result.
            If the future is already done when this method is called, raises
            InvalidStateError.
            """
            if self._state != _PENDING:
                raise exceptions.InvalidStateError(f'{self._state}: {self!r}')
            self._result = result
            self._state = _FINISHED
            self.__schedule_callbacks() 

     def __schedule_callbacks(self):
            """Internal: Ask the event loop to call all callbacks.
            The callbacks are scheduled to be called as soon as possible. Also
            clears the callback list.
            """
            callbacks = self._callbacks[:]
            if not callbacks:
                return
            self._callbacks[:] = []
            for callback, ctx in callbacks:
                self._loop.call_soon(callback, self, context=ctx) 

Once `future.set_result` is called, it would trigger `self.__schedule_callbacks` asking the even loop to call all the `callback`s related to the `Future` as soon as possible. These `Future` related `callback`s are added or removed by `future.add_done_callback` or `future.remove_done_callback`. If no `Future` related `callback`s, no more `callback`s are scheduled in the event loop.

So we have known what will happen after the `Future` got result. What happens when the `Future` is scheduled in the event loop?

From the last blog post [“Python AsyncIO Event Loop”](https://leimao.github.io/blog/Python-AsyncIO-Event-Loop/), we have seen the `Future` was scheduled into the event loop via `loop.ensure_future`. “If the argument is a Future, it is returned directly.” So when the `Future` is scheduled in the event loop, there is almost no `callback` scheduled, until the `future.set_result` is called. (I said almost no `callback` because there is a default `callback` `_run_until_complete_cb` added as we have seen in the last blog post.)

    def ensure_future(coro_or_future, *, loop=None):
        """Wrap a coroutine or an awaitable in a future.
        If the argument is a Future, it is returned directly.
        """
        if coroutines.iscoroutine(coro_or_future):
            if loop is None:
                loop = events.get_event_loop()
            task = loop.create_task(coro_or_future)
            if task._source_traceback:
                del task._source_traceback[-1]
            return task
        elif futures.isfuture(coro_or_future):
            if loop is not None and loop is not futures._get_loop(coro_or_future):
                raise ValueError('The future belongs to a different loop than '
                                 'the one specified as the loop argument')
            return coro_or_future
        elif inspect.isawaitable(coro_or_future):
            return ensure_future(_wrap_awaitable(coro_or_future), loop=loop)
        else:
            raise TypeError('An asyncio.Future, a coroutine or an awaitable is '
                            'required') 

### Task

Because [`_PyFuture = Future`](https://github.com/python/cpython/blob/3.8/Lib/asyncio/futures.py#L269), [`Task`](https://github.com/python/cpython/blob/master/Lib/asyncio/tasks.py#L98) is just a derived class of `Future`. The task of a `Task` is to wrap a `coroutine` in a `Future`.

    class Task(futures._PyFuture):  # Inherit Python Task implementation
                                    # from a Python Future implementation. 
        """A coroutine wrapped in a Future."""
        # An important invariant maintained while a Task not done:
        #
        # - Either _fut_waiter is None, and _step() is scheduled;
        # - or _fut_waiter is some Future, and _step() is *not* scheduled.
        #
        # The only transition from the latter to the former is through
        # _wakeup().  When _fut_waiter is not None, one of its callbacks
        # must be _wakeup(). 
        # If False, don't log a message if the task is destroyed whereas its
        # status is still pending
        _log_destroy_pending = True
        def __init__(self, coro, *, loop=None, name=None):
            super().__init__(loop=loop)
            if self._source_traceback:
                del self._source_traceback[-1]
            if not coroutines.iscoroutine(coro):
                # raise after Future.__init__(), attrs are required for __del__
                # prevent logging for pending task in __del__
                self._log_destroy_pending = False
                raise TypeError(f"a coroutine was expected, got {coro!r}")
            if name is None:
                self._name = f'Task-{_task_name_counter()}'
            else:
                self._name = str(name)
            self._must_cancel = False
            self._fut_waiter = None
            self._coro = coro
            self._context = contextvars.copy_context()
            self._loop.call_soon(self.__step, context=self._context)
            _register_task(self) 

In the constructor, we see that the `Task` schedules a `callback` `self.__step` in the event loop. The [`task.__step`](https://github.com/python/cpython/blob/master/Lib/asyncio/tasks.py#L239) is a long method, but we should just pay attention to the `try` block and the `else` block since these two are the ones mostly likely to be executed.

     def __step(self, exc=None):
            if self.done():
                raise exceptions.InvalidStateError(
                    f'_step(): already done: {self!r}, {exc!r}')
            if self._must_cancel:
                if not isinstance(exc, exceptions.CancelledError):
                    exc = self._make_cancelled_error()
                self._must_cancel = False
            coro = self._coro
            self._fut_waiter = None
            _enter_task(self._loop, self)
            # Call either coro.throw(exc) or coro.send(None).
            try:
                if exc is None:
                    # We use the `send` method directly, because coroutines
                    # don't have `__iter__` and `__next__` methods.
                    result = coro.send(None)
                else:
                    result = coro.throw(exc)
            except StopIteration as exc:
                if self._must_cancel:
                    # Task is cancelled right before coro stops.
                    self._must_cancel = False
                    super().cancel(msg=self._cancel_message)
                else:
                    super().set_result(exc.value)
            except exceptions.CancelledError as exc:
                # Save the original exception so we can chain it later.
                self._cancelled_exc = exc
                super().cancel()  # I.e., Future.cancel(self).
            except (KeyboardInterrupt, SystemExit) as exc:
                super().set_exception(exc)
                raise
            except BaseException as exc:
                super().set_exception(exc)
            else:
                blocking = getattr(result, '_asyncio_future_blocking', None)
                if blocking is not None:
                    # Yielded Future must come from Future.__iter__().
                    if futures._get_loop(result) is not self._loop:
                        new_exc = RuntimeError(
                            f'Task {self!r} got Future '
                            f'{result!r} attached to a different loop')
                        self._loop.call_soon(
                            self.__step, new_exc, context=self._context)
                    elif blocking:
                        if result is self:
                            new_exc = RuntimeError(
                                f'Task cannot await on itself: {self!r}')
                            self._loop.call_soon(
                                self.__step, new_exc, context=self._context)
                        else:
                            result._asyncio_future_blocking = False
                            result.add_done_callback(
                                self.__wakeup, context=self._context)
                            self._fut_waiter = result
                            if self._must_cancel:
                                if self._fut_waiter.cancel(
                                        msg=self._cancel_message):
                                    self._must_cancel = False
                    else:
                        new_exc = RuntimeError(
                            f'yield was used instead of yield from '
                            f'in task {self!r} with {result!r}')
                        self._loop.call_soon(
                            self.__step, new_exc, context=self._context)
                elif result is None:
                    # Bare yield relinquishes control for one event loop iteration.
                    self._loop.call_soon(self.__step, context=self._context)
                elif inspect.isgenerator(result):
                    # Yielding a generator is just wrong.
                    new_exc = RuntimeError(
                        f'yield was used instead of yield from for '
                        f'generator in task {self!r} with {result!r}')
                    self._loop.call_soon(
                        self.__step, new_exc, context=self._context)
                else:
                    # Yielding something else is an error.
                    new_exc = RuntimeError(f'Task got bad yield: {result!r}')
                    self._loop.call_soon(
                        self.__step, new_exc, context=self._context)
            finally:
                _leave_task(self._loop, self)
                self = None  # Needed to break cycles when an exception occurs. 

Here we see the `coroutine.send` method again. Each time we call `coroutine.send` in the `try` block, we get a `result`. In the `else` blcok, we always have another `self._loop.call_soon` call. We do this in a trampoline fashion until `Coroutine` runs out of results to `send`.

### Trampoline Function

    import asyncio
    import time
    def trampoline(loop: asyncio.BaseEventLoop, name: str = "") -> None:
        current_time = time.time()
        print(current_time)
        loop.call_later(0.5, trampoline, loop, name)
        return current_time
    loop = asyncio.get_event_loop()
    loop.call_soon(trampoline, loop, "")
    loop.call_later(5, loop.stop)
    loop.run_forever() 

The flavor of the wrapping of `Task` to `Coroutine` is somewhat similar to trampoline. Every time we call `coroutine.send`, we got some returned values and scheduled another `callback`.

### Conclusion

的实现`asyncio`很复杂，我不希望我能知道所有细节。但是，尝试了解有关低级设计的更多信息可能对实现低级`asyncio`库和防止高级`asyncio`应用程序中的愚蠢错误很有用。

到调度所述密钥的密钥`asyncio`awaitables， ，`Coroutine`，`Future`和`Task`，是该 awaitables 都包装成`Future`在引擎盖下的一些方式`asyncio`的接口。

* * *

 [https://leimao.github.io/blog/Python-AsyncIO-Awaitable-Coroutine-Future-Task/](https://leimao.github.io/blog/Python-AsyncIO-Awaitable-Coroutine-Future-Task/) 
 [https://leimao.github.io/blog/Python-AsyncIO-Awaitable-Coroutine-Future-Task/](https://leimao.github.io/blog/Python-AsyncIO-Awaitable-Coroutine-Future-Task/)
