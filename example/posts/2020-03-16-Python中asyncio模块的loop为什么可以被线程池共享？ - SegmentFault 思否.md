---
title: Python中asyncio模块的loop为什么可以被线程池共享？ - SegmentFault 思否
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

1

# [Python 中 asyncio 模块的 loop 为什么可以被线程池共享？](#)

[![](https://avatar-static.segmentfault.com/156/262/1562628178-582e36dd84a1f_big64)
**kjhlafa**](/u/kjhlafa)

-   443

更新于 2016-12-22

根据官方描述，asyncio 中的事件是属于单个线程的，下面这段程序中即属于 main 线程。但是为什么下面的 ThreadPollExecutor(2) 中的两个线程的能共享一个 loop？

拜托大神解释一下事件循环的本质到底是什么？官方文档只提供了一系列的 api，到现在我也并没有真正的理解。

    import asyncio
    from concurrent.futures import ThreadPoolExecutor

    print('running async test')

    def say_boo():
        i = 0
        while i < 10:
            print('...boo {0}'.format(i))
            i += 1

    def say_baa():
        i = 0
        while i < 10:
            print('...baa {0}'.format(i))
            i += 1

    if __name__ == "__main__":
        executor = ThreadPoolExecutor(2)
        loop = asyncio.get_event_loop()
        boo = asyncio.ensure_future(loop.run_in_executor(executor, say_boo))
        baa = asyncio.ensure_future(loop.run_in_executor(executor, say_baa))

[python](/t/python)[并发](/t/%E5%B9%B6%E5%8F%91)[异步](/t/%E5%BC%82%E6%AD%A5)[asyncio](/t/asyncio)

[![](https://avatar-static.segmentfault.com/192/988/1929889284-5bd162de27e1b_big64)
**fantix**](/u/fantix)

-   1.7k

[发布于 2018-05-08](/q/1010000007863971/a-1020000014773278)

首先，event loop 就是一个普通 Python 对象，您可以通过 `asyncio.new_event_loop()` 创建无数个 event loop 对象。只不过，`loop.run_xxx()` 家族的函数都是阻塞的，比如 `run_until_complete()` 会等到给定的 coroutine 完成再结束，而 `run_forever()` 则会永远阻塞当前线程，直到有人停止了该 event loop 为止。所以在同一个线程里，两个 event loop 无法同时 run，但这不能阻止您用两个线程分别跑两个 event loop。

其次再说 `ThreadPoolExecutor`。您也可以看到，它根本不是 asyncio 库的东西。当您创建一个 `ThreadPoolExecutor` 对象时，您实际上是创建了一个线程池。仅此而已，与 asyncio、event loop 并无瓜葛。而当您明确使用一个 event loop 的 `run_in_executor()` 方法时，其实底层做的只有两件事：

1.  用线程池执行给定函数，与 asyncio 毫无关系；
2.  给线程池执行结果增加一个回调，该回调会在 event loop 的下一次循环中保存执行结果。

所以 `run_in_executor()` 只是将传统的线程池结果拉回到给定 event loop 中，以便进一步处理而已，不存在谁共享谁的关系，指定谁是谁。您可以尝试一下，在多个线程中跑多个 event loop，然后都向同一个线程池扔任务，然后返回结果：

    import asyncio
    import threading
    import time
    from concurrent.futures import ThreadPoolExecutor

    e = ThreadPoolExecutor()


    def worker(index):
        print(index, 'before:', time.time())
        time.sleep(1)
        print(index, 'after:', time.time())
        return index

    def main(index):
        loop = asyncio.new_event_loop()
        rv = loop.run_until_complete(loop.run_in_executor(e, worker, index))
        print('Thread', index, 'got result', rv)


    threads = []
    for i in range(5):
        t = threading.Thread(target=main, args=(i,))
        t.start()
        threads.append(t)

    for t in threads:
        t.join() 

结果大致如下：

    0 before: 1525751873.5256991
    1 before: 1525751873.526891
    3 before: 1525751873.527435
    4 before: 1525751873.5278442
    2 before: 1525751873.528244

    0 after: 1525751874.526666
    1 after: 1525751874.5270479
    Thread 1 got result 1
    Thread 0 got result 0
    3 after: 1525751874.532167
    2 after: 1525751874.532394
    4 after: 1525751874.5327559
    Thread 4 got result 4
    Thread 3 got result 3
    Thread 2 got result 2 

那为什么会有一个进程 / 线程一个 event loop 的说法呢？这是来源于默认 event loop 的概念，也就是 `asyncio.get_event_loop()`。初始情况下，`get_event_loop()` 只会在主线程帮您创建新的 event loop，并且在主线程中多次调用始终返回该 event loop；而在其他线程中调用 `get_event_loop()` 则会报错，除非您在这些线程里面手动调用过 `set_event_loop()`。细节请参考 [文档](https://docs.python.org/3/library/asyncio-eventloops.html?highlight=get_event_loop#event-loop-policy-interface)。

最后关于您的问题 “事件循环的本质到底是什么”：event loop 本身是一个循环，您可以看 `asyncio.base_events.BaseEventLoop._run_once()` 的源码，每个循环就执行这些东西。抛开所有的繁杂，每次循环只做两件事：

1.  干等，什么也不做，一直等到有事件发生；
2.  调用之前注册在这个事件上的处理代码。

[仅此而已](https://en.wikipedia.org/wiki/Cooperative_multitasking)。这里的事件主要包括定时器事件和 I/O 事件，所有跑在 event loop 上的您的代码都是由一个事件触发的，然后反复地交错地跑，宏观上看就是异步并发了。

 [https://segmentfault.com/q/1010000007863971](https://segmentfault.com/q/1010000007863971) 
 [https://segmentfault.com/q/1010000007863971](https://segmentfault.com/q/1010000007863971)
