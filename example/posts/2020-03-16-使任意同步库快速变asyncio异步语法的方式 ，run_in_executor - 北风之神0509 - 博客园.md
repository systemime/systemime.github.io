---
title: 使任意同步库快速变asyncio异步语法的方式 ，run_in_executor - 北风之神0509 - 博客园
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

![](https://common.cnblogs.com/images/copycode.gif)

from functools import partial import asyncio from threadpool_executor_shrink_able import ThreadPoolExecutorShrinkAble  # 没有使用内置的 concurrent.futures 里面的，这个是优化 4 点功能的。
 async_executor \\= ThreadPoolExecutorShrinkAble(20)

async def simple_run_in_executor(f, \*args, async_loop=None, \*\*kwargs):
    loopx \\= async_loop or asyncio.get_event_loop() # print(id(loopx))
    result = await loopx.run_in_executor(async_executor, partial(f, \*args, \*\*kwargs)) return result if \_\_name\_\_ == '\_\_main\_\_': import time import requests def block_fun(x):
        time.sleep(5) print(x) return x \* 10 async def enter_fun(xx):  # 入口函数，盈利为一旦异步，必须处处异步。不能直接调用 block_fun，否则阻塞其他任务。
        await asyncio.sleep(1)  

        # r = block\_fun(xx)  # 如果你这么写那就完了个蛋，程序运行完成需要更长的时间。
        r \= await  simple\_run\_in\_executor(block\_fun, xx) print(r)


    loopy \= asyncio.get\_event\_loop() print(id(loopy))
    tasks \= \[\]
    tasks.append(simple\_run\_in\_executor(requests.get, url\='http://www.baidu.com'))

    tasks.append(simple\_run\_in\_executor(block\_fun, 1))
    tasks.append(simple\_run\_in\_executor(block\_fun, 2))
    tasks.append(simple\_run\_in\_executor(block\_fun, 3))

    tasks.append(enter\_fun(4))
    tasks.append(enter\_fun(5)) print('开始')
    loopy.run\_until\_complete(asyncio.wait(tasks)) print('结束')

![](https://common.cnblogs.com/images/copycode.gif)

使用 asyncio 时候，一个调用链流程包括了 5 个 阻塞 io 的方法或函数，如果其中一个函数现在没有对应的异步库，或者新的对应异步库很难学，快速的方式是让同步函数变成异步调用语法，可以被 await，那么按上面这么封装就行了，例如假设还没有人发明 aiohttp 库，世上只有 requests 库，你的调用链流程里面不可以直接调用 requests，因为一旦这么弄，只要一个任务阻塞了，真个循环的全部任务都被阻塞了，使用 asyncio 一旦异步需要处处异步，那么怎么样快速的非阻塞呢，按上面就行，使同步函数在线程池里面运行，这个 run_in_executor 本质是使 concurrent.futures.Future 对象变成了 asyncio 里面的可等待 Future 对象，所以可以被 await。

有人会有疑问，这么不是脱了裤子放屁吗，直接在异步流程里面 使用 threadpoolexecutor.submit 来运行同步阻塞函数不香吗，这不就能绕开阻塞了吗？主要还是有个概念没搞懂，因为现在不仅是要非阻塞运行同步函数，最重要的是要在当前代码处拿到同步函数的执行结果马上使用， future = threadpoolexecutor.submit(block_fun,20)  然后为了得到结果需要执行 future.result()，一旦使用了 future.result()，那么当前调用链又回到老问题了，那就是被阻塞。解决这个问题唯有使用  

r = await  simple_run_in_executor(block_fun, 20)，既能在线程池运行同步函数，而且为了得到结果不至于阻塞事件循环。

还有一点是为什么不使用官方的 loop.run_in_executor，而是封装了一个 simple_run_in_executor 东西呢，主要是因为 内置的 run_in_executor 方法，不接受关键字参数，只能接受位置参数，例如 requests.get 函数，入参个数高达 20 个，如果严格的使用位置参数，那么 requests.get 函数的入参顺序必须按照定义的一样非常准确一个顺序都不能乱，必须要非常精确小心，这几乎不可能做到。

![](https://img2020.cnblogs.com/blog/1108990/202012/1108990-20201230101542021-272733335.png)

run_in_executor 必须严格的按照顺序传参，例如你想设置 request 的 timeout 值，必须在前面写很多个 None 来占位置；还有例如不能把 headers 写在 data 前面，不支持关键字方式入参，很难用。使用偏函数来解决关键字入参是官方教程推荐的方式。

![](https://img2020.cnblogs.com/blog/1108990/202012/1108990-20201230101926892-2014301478.png)

参考链接  [https://docs.python.org/zh-cn/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor](https://docs.python.org/zh-cn/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor "https&#x3A;//docs.python.org/zh-cn/3/library/asyncio-eventloop.html#asyncio.loop.run_in_executor")

只有使用我这个 simple_run_in_executor ，立即让同步函数化身异步语法，使同步库的函数和调用链上的其他异步库的函数能够协同作战。

run_in_executor 到底是协程程运行的还是线程运行的阻塞函数呢，毫无疑问还是线程里面运行的，在 block_fun 函数里面打印一下 threding.ident 的线程号就可以了。  
他的主要作用不是把同步变成协程运行，而是让其拥有了异步 await 的用法，既能不阻塞当前事件循环，又能在同步函数执行完成 return 结果时拿到结果接着用。

此文分别拿 blcok_fun 函数和 requests.get 函数来演示同步函数在异步调用链里面非阻塞运行，说的是快速同步变异步的方式，归根结底还是线程运行。但是例如有人已经发明了 aiohttp 异步请求库，那就不需要使用 run_in_executor  + requests 了，最好是使用 aiohttp 就行了。  
这个主要是为了例如 调用链路上用了 10 个 io 操作的库，其中有 9 个有对应的异步库，但有 1 个没有对应的异步库，此时不能因为现存的没有人发明这个异步库就不继续写代码罢工了吧。

**2. 比较 asyncio.run_coroutine_threadsafe 和 run_in_executor**

asyncio.run_coroutine_threadsafe 和 run_in_executor 是一对反义词。

asyncio.run_coroutine_threadsafe 是在非异步的上下文环境 (也就是正常的同步语法的函数里面) 下调用异步函数对象（协程），  
因为当前函数定义没有被 async 修饰，就不能在函数里面使用 await，必须使用这。这个是将 asyncio 包的 future 对象转化返回一个 concurrent.futures 包的 future 对象。

run_in_executor 是在异步环境（被 async 修饰的异步函数）里面，调用同步函数，将函数放到线程池运行防止阻塞整个事件循环的其他任务。  
这个是将 一个 concurrent.futures 包的 future 对象 转化为 asyncio 包的 future 对象，  
asyncio 包的 future 对象是一个 asyncio 包的 awaitable 对象，所以可以被 await，concurrent.futures.Future 对象不能被 await。

反对极端面向过程编程思维方式，喜欢面向对象和设计模式的解读，喜欢对比极端面向过程编程和 oop 编程消耗代码代码行数的区别和原因。致力于使用 oop 和 36 种设计模式写出最高可复用的框架级代码和使用最少的代码行数完成任务，致力于使用 oop 和设计模式来使部分代码减少 90% 行，使绝大部分 py 文件最低减少 50%-80% 行的写法。 
 [https://www.cnblogs.com/ydf0509/p/14210083.html](https://www.cnblogs.com/ydf0509/p/14210083.html) 
 [https://www.cnblogs.com/ydf0509/p/14210083.html](https://www.cnblogs.com/ydf0509/p/14210083.html)
