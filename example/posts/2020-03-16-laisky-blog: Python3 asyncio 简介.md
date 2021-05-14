---
title: Python3 asyncio 简介
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

> Updated:
>
> -   updated at 2017/05/08: add locks
> -   updated at 2018/03/09: 大幅修改概述
> -   updated at 2018/03/12: 增加多进程
> -   updated at 2018/07/11: 改错别字

**本文旨在科普 Python3 的 asyncio 基础用法和基本的异步观念。** 

## 一、起因

两年前就想介绍一下 Python 3 强大的 asyncio 了，一直拖到现在。以前曾记录过近来几次 Python 版本的升级。

在上述几篇文章里都提到了 asyncio 这个堪称是彻底重塑了 Python 3 的神奇模块，我尝试在此文里介绍它的基础用法， 希望能帮助树立起异步的思维来。

画图太累，我就用直白粗俗的文字来描述了。

* * *

## 二、概述

> -   [Tasks and coroutines](https://docs.python.org/3/library/asyncio-task.html)

### 1、Terms

并发指的是同时启动任务，并行指的是同时运行任务。依赖时间切片和多核，并发也可以是并行。下文中统称为并发，都指的是并行的并发。

现实中需要解决的问题有两类：

-   CPU bound
-   IO bound

CPU bound 指的是需要密集 CPU 运行的任务，IO bound 指的是有大量等待 IO 的任务。CPU bound 只能通过多核并行来解决，而 IO bound 则是本文的重点，也是 asyncio 大显身手的地方。

### 2、并发

单核 CPU 的性能有其极限，所以我们需要并发来提高性能。但是并发又会导致资源的竞争，所以需要引用锁来保护敏感区。但是锁又会降低并发度，所以我们需要探索无锁的并发方案。

可以使用线程模型来提高并发度，但是每一个线程都需要独立的栈空间（64-bit JVM 中是 1024 KB），这还只是不包含任何资源的初始栈空间，而且栈空间的大小和线程切换的开销成正比。所以我们需要寻找比线程更轻量的解决方案。

为了减少线程的切换，我们可以创建一个等于 CPU 核数的线程池，把需要运算的逻辑放进线程池，不需要时就拿出来换成其他的任务，保持线程的持续运算而不是切换。

为了更好的使用 CPU 的性能，我们应该在任务不在需要 CPU 资源时让其从线程池里退出来（比如等待 IO 时），这就需要有一种机制，让任务可以在阻塞时退出，在资源就绪时恢复运行。 所以我们将任务抽象为一种用户态的线程（协程，greenthread、coroutine），当其需要调用阻塞资源时，就在 IO 调度器里注册一个事件，并让出线程资源给其他协程， 当资源就绪时，IO 调度器会在有空余线程资源时，重新运行这个协程。

补充说明一下，在原生线程模型下，如果一个线程调用了阻塞接口（syscall），它也会被操作系统调度，让出 CPU 资源给其他 ready 的线程。 当线程数很多的时候，这就会构成较大的上下文切换开销（栈、寄存器）。使用用户态线程，尽可能的改为调用异步系统接口，然后采用 epoll 等方案监听就绪事件， 由 runtime 中实现的 scheduler 来在用户态根据就绪事件来切换不同的用户线程到同一个系统线程上运行，从操作系统层面来看，一直都是同一个内核线程在运行， 没有任何阻塞发生，所以切换开销极小。

需要注意的是，并不是所有的 syscall 都有异步接口，所以即使是在协程环境下，其实有时候还是需要依赖于内核线程， 比如可以看一下 `aiofile` 的实现就是依赖于线程池。这其实也是一个思路，偷懒的时候，可以简单粗暴的用线程池把所有的阻塞任务都封装为 coroutine。

用户态线程（下文称之为协程）的设计方案一般有三种（按照用户态线程和系统线程的比例）：

-   1:1：直接使用系统线程，可以利用多核，但是上下文开销大；
-   N:1：多协程对应一个线程，节省了上下文开销，缺点是不能利用多核，asyncio 就是这个方案；
-   M:N：多协程对应多线程，golang 的方案。

协程的优点在于，这是一种用户态的机制，避免的内核态用户态切换的成本，而且初始栈空间可以设置的很小（Golang 中的 goroutine 仅为 2 KB），这样可以创建比线程更大数量的协程。

* * *

## 三、Python 异步的历史

简单聊几句。

我最早听说的异步库就是 twisted，不过据说使用极其复杂，所以望而却步了。

后来在 GoogleAppEngine 上用 web.py 开发后端，接着不久就遇上了 [Aaron 不幸被逼自杀](https://en.wikipedia.org/wiki/Aaron_Swartz)， 在选择新的后端框架时听说了 tornado， 被其简单的用法所折服，一直用到现在，这个博客也是用 tornado 开发的，我甚至还自己撸了一整套 RESTful 的框架。

不过其实用了 tornado 一两年后才真正的看懂了它 ioloop 的设计，不得不说 tornado 的注释写的真的很好，强烈推荐学习 tornado 的源码。

tornado 中最难解决的问题就是如何去调度嵌套的异步任务，因为 tornado 是通过 yield 和 decorator 相结合的方式来实现异步任务， 所以导致异步函数很难返回值，在 tornado 里你只能通过 raise 的方式来返回值，这又导致 coroutine 很难正确的捕获到异常，为了解决这个问题我自己写了一个 decorator， 然后每次写 tornado 时都是一大堆的：

```python
@tornado.gen.coroutine
@debug_wrapper
def xxx():
    # ...
    raise tornado.gen.Return(xxx)
```

挺烦。

不过 Python 界的主流后端框架除了 tornado 外还有 flask 和 django，那么使用这两种框架的人在遇到密集的 IO 时该怎么办呢？ 还好有神奇的 gevent！gevent 通过 patch 的方式将各种常见的 IO 调用封装为协程，并且将整个调度过程完全封装，用户可以用近乎黑盒的方式来使用， 你唯一需要做的就是先手动 patch 一下，然后用 gevent.spawn 去发起任务，如果需要同步的话就再 joinall 一下。 可以说 gevent 选择了和 golang 一样的思路，gevent.spawn 就像是 golang 里的 goroutine，gevent 再继续优化升级下去，终极目标就是实现 golang 的 runtime 吧。

gevent 的一个例子：

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
cost 0.7102580070495605s for url http://httpbin.org/user-agent
cost 0.7106029987335205s for url http://httpbin.org/get
cost 0.7245540618896484s for url http://httpbin.org/headers
cost 0.7327840328216553s for url http://httpbin.org/
cost 1.073429822921753s for url http://httpbin.org/ip
total cost 1.0802628993988037s
"""
import time

import gevent
import gevent.monkey


gevent.monkey.patch_socket()

try:
    import urllib2
except ImportError:
    import urllib.request as urllib2


TARGET_URLS = (
    'http://httpbin.org/',
    'http://httpbin.org/ip',
    'http://httpbin.org/user-agent',
    'http://httpbin.org/headers',
    'http://httpbin.org/get',
)


def demo_task(url):
    start_ts = time.time()
    r = urllib2.urlopen(url)
    print('cost {}s for url {}'.format(time.time() - start_ts, url))


def demo_handler():
    start_ts = time.time()
    tasks = [gevent.spawn(demo_task, url) for url in TARGET_URLS]
    gevent.joinall(tasks)
    print('total cost {}s'.format(time.time() - start_ts))


def main():
    demo_handler()


if __name__ == '__main__':
    main()
```

Python 3 的官方的解决方案 asyncio 选择了更为白盒的调用方式， 该方案极大的吸收了 tornado 的优点，并且为了解决 tornado 的协程返回，增加了新语法 yield from， 所以在 Python 3.4 的时代，你可以用近乎和 tornado 完全相同的方法写 asyncio：

```python
# python 3.4
# 注意：Python 3.6 已经不这么写了

import asyncio


@asyncio.coroutine
def coroutine_demo():
    r = yield from coroutine_child_demo()
    print(r)


@asyncio.coroutine
def coroutine_child_demo():
    asyncio.sleep(1)
    return 2
```

不过这么写还是太丑陋，而且总让人觉得 coroutine 只是一个第三方包提供的功能，好在反正 asyncio 包被声明为一个不稳定的开发状态的包， 所以我们可以继续大改，所以 asyncio 的大幅修改一直到了 Python3.6 才算正式结束。

Python 3.6 作为 asyncio 的第一个稳定版，新的语法已经变成了这样：

```python
import asyncio


async def coroutine_demo():
    r = awiat coroutine_child_demo()
    print(r)


async def coroutine_child_demo():
    asyncio.sleep(1)
    return 2


if __name__ == '__main__':
    ioloop = asyncio.get_event_loop()
    ioloop.run_until_complete(coroutine_demo())
```

下面会稍微详细的讲解 asyncio 包的用法。

* * *

## 四、asyncio

后面的例子里，我都会用 `asyncio.sleep` 来表示一个耗时的阻塞操作， 你可以将其理解为实际操作中的网络请求或文件读写等 IO 操作。

### 1、corouine

首先，你要会创建协程：

```python

async def coroutine_demo():
    await asyncio.sleep(2)


print(coroutine_demo)
# <function coroutine_demo at 0x7fd35c4c89d8>

print(coroutine_demo())
# <coroutine object coroutine_demo at 0x7fd35c523ca8>
```

协程都是非阻塞的，当你调用一个协程时（形如 `coroutine_demo()`）， 这个协程程序就被执行了，直到执行到另一个协程（`asyncio.sleep`）， 这时会在 ioloop 里挂起一个事件，然后立刻返回。

此时你需要做的，就是继续干你的事情，并且确保你给了这个协程足够的时间执行完成， 所以继续写完这个简短的脚本：

```python
if __name__ == '__main__':
    ioloop = asyncio.get_event_loop()  # 创建事件循环 ioloop
    coroutine = coroutine_demo()  # 启动协程
    future = asyncio.ensure_future(coroutine)  # 将其封装为 Future 对象

    # 然后就只需要将 future 提交给 ioloop，让其等待该 future 对象完成就行了
    ioloop.run_untile_complete(future)
    print('all done')

```

### 2、Task & Future

Future 有点像是一个 lazy object，当你调用一个协程时，这个协程会被注册到 ioloop， 同时该协程会立刻返回一个 coroutine 对象，然后你可以用 `asyncio.ensure_future` 将其封装为一个 Future 对象。

当协程任务结束时，这个 future 对象的状态也会变化，可以通过这个 future 对象来获取该任务的结果值（或异常）：

```python
future = asyncio.ensure_future(coroutine_demo())


future.done()
# 任务是否结束
# True or False

future.result(timeout=None)
# 获取任务的结果
# 默认会阻塞等待到任务结束
```

目前提到了 coroutine、Task 和 future，对于这三者的关系，我的理解如下：

-   coroutine 是一种函数，可以用来定义协程；
-   Task 就是 future，是 asyncio 里最小的任务单位，asyncio 里的各种调度都是基于 future 来就进行的；

下面举一些用例

### 3、调度

先简单的说一下 asyncio 的使用，首先你需要启动一个主函数，在主函数里你实例化 ioloop， 然后在这个 ioloop 里注册任意多的 task，task 也可以注册子 task，之后你可以选择让 ioloop 永久的运行下去， 或者运行到最后一个 task 完成为止。

首先看一个最简单的案例，请求多个 URL：

```python
urls = [
    'https://httpbin.org/',
    'https://httpbin.org/get',
    'https://httpbin.org/ip',
    'https://httpbin.org/headers',
]

async def crawler():
    async with aiohttp.ClientSession() as session:
        futures = map(asyncio.ensure_future, map(session.get, urls))
        for f in asyncio.as_completed(futures):
            print(await f)


if __name__ == '__main__':
    ioloop = asyncio.get_event_loop()
    ioloop.run_untile_complete(asyncio.ensure_future(crawler()))

```

上面的例子里可以看到，我们启动了很多了 `session.get` 的子协程，然后用 `asyncio.ensure_future` 将其封装为 `future`， 然后调用 `as_completed` 方法监听这一堆的子任务，每当有子任务完成时，就会触发 for 循环对结果进行处理。

asyncio 里除了 `as_completed` 外，常用的还有 `asyncio.wait(fs, timeout=None, when=ALL_COMPLETED)`。 方法就是可以等待多个 `futures`，`when` 参数可以设定等待的模式，可接受的参数有：

-   `FIRST_COMPLETED`：等到第一个完成；
-   `FIRST_EXCEPTION`：等到一个出错；
-   `ALL_COMPLETED`：等待全部完成。

所以上面的函数，`as_completed` 那段还可以写成：

```python
await asyncio.wait(futures)
for f in futures:
    print(f.result())
```

### 4、定时任务

除了上面举的那些事件触发的任务外，asyncio 还可以依靠时间进行触发。

```python
ioloop = asyncio.get_event_loop()

# 一段时间后运行
ioloop.call_later(delay_in_seconds, callback, args)

# 指定时间运行
ioloop.call_at(when, callback, *args)
```

这里需要注意的是，ioloop 使用的是自己的时间，你可以通过 `ioloop.time()` 获取到 ioloop 当前的时间， 所以如果你要用 `call_at`，你需要计算出相对于 ioloop 的时间。所以其实这个方法没什么意义，一般用 `ioloop.call_later` 这个方法用的更多。

* * *

## 五、锁

### 1、并发控制

协程带来的性能提升非常的显著，以至于你需要考虑一个你以前可能从未考虑过的问题：并发控制。 对资源的控制也是异步编程的难点所在。

举个例子，你需要下载 100 万 张图片，过去你开了 20 个 线程来下载，那么在同一时间最大的并发量就是 20， 对于服务器而言，最多需要处理 20 qps 的请求，对于客户端而言，最多需要在内存里放 20 张 图片的数据，仅此而已。

但是进入协程时代，所有的东西都是非阻塞的，你可以在很短的时间内向远程发起 100 万 的请求， 也可能在内存里挂起 100 万 次请求的数据，这无论对于服务端还是客户端都是难以接受的。

asyncio 里提供了四种锁：

-   Lock
-   Semaphore
-   Event
-   Condition

下面先介绍一个最常用的案例，然后再逐一介绍这几个锁的区别。

首先讲一下协程任务的并发控制，asyncio 提供了信号量方法 `asyncio.Semaphore(value=1)` ， 这个方法会返回一个信号量，你可以初始化一个信号量后，然后在每次发起请求时都去请求这个信号量， 来实现对协程任务数量的控制，比如我们可以通过信号量来控制对服务器的请求并发数：

```python
# initiallize semaphore
concurrency_sem = asyncio.Semaphore(50)

async with aiohttp.ClientSession() as session:
while 1:  # 即使这样写也不用担心并发数会爆炸啦
    # require semaphore
    # will be blocked when accesses to 50 concurrency
    async with concurrency_sem:
        async with session.get(url, timeout=10) as resp:
            assert resp.status == 200
```

_如果不知道信号量是什么，可以参阅[《并行编程中的各种锁》](https://blog.laisky.com/p/concurrency-lock/)。_

信号量可以有效的控制同一时间任务的并发数，但是有时候一些协程任务的执行非常迅速， 导致任务执行返回的数据大量堆积，也就是所我们需要限制任务的处理总量，而不是并发量， 这时候就可以采用 `asyncio.Queue(maxsize=0)` 来进行控制， 我们可以通过设定 `maxsize` 来设定队列的总长度，当队列满时，`put` 操作就会被挂起， 直到后续逻辑逐渐消化掉了队列里的任务后，才能继续添加，这样就实现了对任务堆积总量的控制。

比如我们可以用 Queue 来限制我读取大文件时，不要一下子把整个文件都读进来， 而是读几行，处理几行：

```python
task_q = asyncio.Queue(maxsize=1000)


async def worker_to_process_each_line():
    while not task_q.empty():
        line = await task_q.get()
        # do something with this line


with open('huge_file_with_many_lines.txt', 'r') as f:
    worker_to_process_each_line()
    for line in f:
        await task_q.put(line)
```

活用 `Semaphore` 和 `Queue`，基本就可以解决绝大部分的并发控制问题了。

### 2、Lock

最简单的互斥锁，其实会用 Semaphore 的话完全不需要用 Lock 了，毕竟 mutex 只是 Semaphore 为 1 时的特例。

```python
lock = Lock()
async with lock():
    # ...
```

### 3、Event

事件锁，这个锁有两个状态：`set` 和 `unset`，可以调用 `evt.wait()` 挂起等待，直到这个事件被 `set()`：

```python
evt = Event()

async def demo():
    await evt.wait()  # wait for set
    print('done)


demo()
print(evt.is_set())
# False


evt.set()  # release evt
# done
```

### 4、Condition

就像 Semaphore 可以简单理解为带计数器的 Lock，Condition 也可以简单理解为带计数器的 Event。

一个 Condition 可以被多个协程等待，然后可以按照需求唤醒指定数量的协程。

其实 Condition 是 threading 模块里一直存在的锁，简单介绍一下使用方法， 使用 condition 前需要先获取锁（`async with cond`），这是一个互斥锁，调用 `wait()` 时会自动的释放锁， ，针对 condition 的 `notify`、`notify_all、`wait`必须在获取锁后才能操作，否则会抛出`RuntimeError\` 错误。

所以当你 notify 后如果需要立即生效的话，需要退出这个 mutex，并且挂起当前协程等待调度， 其他协程才能顺利的获取 mutex，并且获取到 condition 的信号，执行后续的任务，并在完成后释放锁。

```python
from asyncio import Condition, sleep, get_event_loop, wait, ensure_future


async def workers(cond, i):
    async with cond:  # require lock
        print('worker {} is waiting'.format(i))
        await cond.wait()  # wait for notify and release lock

    print('worker {} done, released'.format(i))


async def main():
    cond = Condition()
    fs = list([ensure_future(workers(cond, i)) for i in range(5)])  # run workers

    await sleep(0.1)
    for i in range(3):
        print('notify {} workers'.format(i))
        async with cond:  # require lock
            cond.notify(i)  # notify

        await sleep(0.1)  # let another coroutine run

    async with cond:
        await sleep(0.5)
        print('notify all')
        cond.notify_all()

    await wait(fs)  # wait all workers done



get_event_loop().run_until_complete(main())

# Output:
# worker 0 is waiting
# worker 1 is waiting
# worker 2 is waiting
# worker 3 is waiting
# worker 4 is waiting
# notify 0 workers
# notify 1 workers
# worker 0 done, released
# notify 2 workers
# worker 1 done, released
# worker 2 done, released
# notify all
# worker 3 done, released
# worker 4 done, released
```

* * *

## 六、多进程

上面提到了，python asyncio 的实现方案是 N:1，所以协程是不能跨核的。为了利用多核，你需要创建多进程程序，并且为每一个进程初始化一个 ioloop。

我们可以使用 `concurrent.futures` 里提供的 `ProcessPoolExecutor` 来轻松的实现多进程。

```python
from concurrent.futures import ProcessPoolExecutor, as_completed
from asyncio import get_event_loop, sleep, ensure_future


async def coroutine_demo():
    await sleep(1)

def runner():
    ioloop = get_event_loop()
    future = ensure_future(coroutine_demo())
    ioloop.run_until_complete(future)


def main():
    executor = ProcessPoolExecutor(max_workers=7)  # CPU 数 - 1
    for futu in as_completed([executor.submit(runner) for _ in range(7)]):
        result = futu.result()
        # ...

```

### 1、多线程

顺便提一下多线程，有时候需要兼容旧代码，你需要调用过去用线程写的程序，或者有些阻塞没法用 asyncio 解决，你只能包一层线程，但是你又希望用 asyncio 的方式来调用，这时候就需要用到 `run_in_executor`。

代码片段示例：

```python
from concurrent.futures import ThreadPoolExecutor
import time

executor = ThreadPoolExecutor(max_workers=10)
ioloop = get_event_loop()

def something_blocking():
    time.sleep(5)

# 关键代码
ioloop.run_in_executor(executor, something_blocking, *args)
```

你可以通过 `ioloop.set_default_executor(executor)` 设置好常用的 executor，之后再调用 `run_in_executor(None, somthing_blocking, *args)` 的时候，第一个参数就可以传 `None` 了。

* * *

## 七、社区

因为 asyncio 几乎颠覆了过去 python 的写法逻辑，如果你要使用 asyncio，你几乎需要重构所有的阻塞库，不过感谢活跃的社区，目前各种第三方库发展的速度非常快。

比如你可以在下面这个页面找到各式各样的支持 asyncio 的第三方库：

-   [aio-libs](https://github.com/aio-libs)

而且因为 asyncio 已经作为官方的事实标准，所以包括 tornado 在内的第三方异步解决方案目前也开始对 asyncio 提供了支持。我稍后会另写一篇介绍如何将过去的 tornado 项目无缝的迁移到 asyncio 来。

* * *

知识点差不多就这些，了解了这些，就可以上手开动了。

* * *

## 八、实用案例

为了方便，我写过一个基于 asyncio 的脚本框架，可以按时执行各个任务：[https://github.com/Laisky/ramjet](https://github.com/Laisky/ramjet)

还有一个用 python 测试 ES 性能的小脚本：[https://github.com/Laisky/BenchmarkElasticsearchByPython3/blob/2e0267436f0a75e0f15b79b966a773adf6476489/benchmark.py](https://github.com/Laisky/BenchmarkElasticsearchByPython3/blob/2e0267436f0a75e0f15b79b966a773adf6476489/benchmark.py)

再贴一个给同事写的批量下载 s3 图片的脚本，这个脚本需要读取一个有一千万行的图片文件地址文件， 然后按照每一行的地址去请求服务器下载文件，所以我做了一次最多读取 1000 行，最多发起 10 个 连接的并发控制：

```python
import os
import asyncio
import datetime

import aiohttp
import aiofiles


async def image_downloader(task_q):
    async with aiohttp.ClientSession() as session:
        while not task_q.empty():
            url = await task_q.get()
            try:
                async with session.get(url, timeout=5) as resp:
                    assert resp.status == 200
                    content = await resp.read()
            except Exception as err:
                print('Error for url {}: {}'.format(url, err))
            else:
                fname = split_fname(url)
                print('{} is ok'.format(fname))
                await save_file(fname, content)


def split_fname(url):
    # do something
    return 'FILENAME_AFTER_PROCESSED'


async def save_file(fname, content):
    async with aiofiles.open(fname, mode='wb') as f:
        await f.write(content)


async def produce_tasks(task_q):
    with open('images.txt', 'r') as f:
        for count, image_url in enumerate(f):
            image_url = image_url.strip()

            if os.path.isfile(split_fname(image_url)):
                continue

            await task_q.put(image_url)


async def run():
    task_q = asyncio.Queue(maxsize=1000)
    task_producer = asyncio.ensure_future(produce_tasks(task_q))
    workers = [asyncio.ensure_future(image_downloader(task_q)) for _ in range(10)]
    try:
        await asyncio.wait(workers+[task_producer])
    except Exception as err:
        print(err.msg)


def main():
    print('start at', datetime.datetime.utcnow())
    ioloop = asyncio.get_event_loop()
    ioloop.run_until_complete(asyncio.ensure_future(run()))
    print('end at', datetime.datetime.utcnow())


if __name__ == '__main__':
    main()

```

## 九、Relates

-   [What’s New in Python 3.4](https://blog.laisky.com/p/whats-new-in-python3-4/)
-   [What’s New in Python 3.5](https://blog.laisky.com/p/whats-new-in-python3-5/)
-   [What’s New in Python 3.6](https://blog.laisky.com/p/whats-new-in-python3-6/)
-   [Python 的版本管理和环境隔离](https://blog.laisky.com/p/pyenv/)
-   [《Python 源码剖析》摘抄](https://blog.laisky.com/p/python-source/)
-   [python 的静态类型检查工具 mypy](https://blog.laisky.com/p/mypy/) 
    [https://blog.laisky.com/p/asyncio/](https://blog.laisky.com/p/asyncio/) 
    [https://blog.laisky.com/p/asyncio/](https://blog.laisky.com/p/asyncio/)
