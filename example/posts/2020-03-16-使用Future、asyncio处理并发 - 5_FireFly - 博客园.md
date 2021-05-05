---
title: 使用Future、asyncio处理并发 - 5_FireFly - 博客园
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

> 为了高效处理网络 I/O，需要使用并发，因为网络有很高的延迟，所以为了不浪费 CPU 周期去等待，最好在收到网络响应之前做些其他的事。
>
> 在 I/O 密集型应用中，如果代码写得正确，那么不管是用哪种并发策略（使用线程或 asyncio 包），吞吐量都比依序执行的代码高很多。

_**并发是指一次处理多件事。并行是指一次做多件事。一个关于结构，一个关于执行。** _

并行才是我们通常认为的那个同时做多件事情，而并发则是在线程这个模型下产生的概念。

并发表示同时发生了多件事情，通过时间片切换，哪怕只有单一的核心，也可以实现 “同时做多件事情” 这个效果。

根据底层是否有多处理器，并发与并行是可以等效的，这并不是两个互斥的概念。

举个我们开发中会遇到的例子，我们说资源请求并发数达到了 1 万。这里的意思是有 1 万个请求同时过来了。但是这里很明显不可能真正的同时去处理这 1 万个请求的吧！

如果这台机器的处理器有 4 个核心，不考虑超线程，那么我们认为同时会有 4 个线程在跑。

也就是说，并发访问数是 1 万，而底层真实的并行处理的请求数是 4。

如果并发数小一些只有 4 的话，又或者你的机器牛逼有 1 万个核心，那并发在这里和并行一个效果。

也就是说，并发可以是虚拟的同时执行，也可以是真的同时执行。而并行的意思是真的同时执行。

结论是：_**并行是我们物理时空观下的同时执行，而并发则是操作系统用线程这个模型抽象之后站在线程的视角上看到的 “同时” 执行。** _

一、初识 future

_**concurrent.futures 模块主要特色是：** _**ThreadPoolEXecutor**_**和**_ **ProcessPoolExecutor\*\***类 \*\*，这两个类实现的接口能分别在不同的线程或进程中执行可调用的对象。

这两个类在内部维护着一个工作线程或进程池，以及要执行的任务队列。

![](https://common.cnblogs.com/images/copycode.gif)

from concurrent import futures

MAX_WORKERS \\= 20

def download_many():

    workers \= min(MAX\_WORKERS,len(url\_list))
    with futures.ThreadPoolExecutor(workers) as executor:
        res \= executor.map(download\_one,sorted(url\_list))  
    return len(list(res))

![](https://common.cnblogs.com/images/copycode.gif)

（1）设定工作的线程数量，使用允许的最大值与要处理的数量之间的较小的那个值，以免创建过于的线程。

（2）download_one 函数在多个线程中并发调用，map 方法返回一个生成器，因此可以迭代，获取各个函数返回的值。

future 是 concurrent.futures 模块和 asyncio 包的重要组件。

从 python3.4 开始标准库中有两个名为 Future 的类：concurrent.futures.Future 和 asyncio.Future

这两个类的作用相同：**两个 Future 类的实例都表示可能完成或者尚未完成的延迟计算。** 与 Twisted 中的 Deferred 类、Tornado 框架中的 Future 类的功能类似

future 封装待完成的操作，可以放入队列，完成的状态可以查询，得到结果（或抛出异常）后可以获取结果（或异常）。

▲ 通常情况下自己不应该创建 future，只能由并发框架（concurrent.future 或 asyncio）实例化。

**future 表示终将发生的事情，而确定某件事会发生的唯一方式就是执行的时间已经排定。** 

**只有排定把某件事交给 concurrent.futures.Executor 子类处理时，才会创建 concurrent.futures.Future 实例。** 

**Executor.submit(fn, \*args, \*\*kwargs)**

Executor.submit() 方法的参数是一个可调用的对象，调用这个方法后会为传入的可调用对象排期，返回一个 future。

▲ 不是阻塞的，而是立即返回。能够使用 done() 方法判断该任务是否结束。

使用 cancel() 方法可以取消提交的任务，如果任务已经在线程池中运行了，就取消不了。

客户端代码不应该改变 future 的状态，并发框架在 future 表示的延迟计算结束后会改变 future 状态。而我们无法控制计算何时结束。

**Executor.shutdown(wait=True)**

释放系统资源, 在 Executor.submit() 或 Executor.map() 等异步操作后调用。**使用 with 语句可以避免显式调用此方法**。

shutdown(wait=True) 相当于进程池的 **pool.close()+pool.join()**操作

wait=True，等待池内所有任务执行完毕回收完资源后才继续，--------》默认

wait=False，立即返回，并不会等待池内的任务执行完毕

但不管 wait 参数为何值，整个程序都会等到所有任务执行完毕

**Executor.add_done_callback(fn)**

future 都有 .add_done_callback(fn) 方法，这个方法只有一个参数，类型是可调用的对象，future 运行结束后会调用指定的可调用对象。

fn 接收一个 future 参数，通过 obj.result()，获得执行后结果。

**Executor.result()**

.result() 方法，在 future 运行结束后调用的话，返回可调用对象的结果，或者重新抛出执行可调用的对象时抛出的异常。

如果没有运行结束，concurrent 会阻塞调用方直到有结果可返回。

**concurrent.futures.as_completed()**

使用_**concurrent.futures.as_completed 函数**_，这个函数的参数是一个_**future 列表 / future 为 key 的字典**_，返回值是一个生成器，

在没有任务完成的时候，会阻塞，在有某个任务完成的时候，会 yield 这个任务 future，就能执行 for 循环下面的语句，然后继续阻塞，循环到所有的任务结束。

从结果也可以看出，先完成的任务会先通知主线程。

**Executor.map(\*\***func, \*iterables, timeout=None\***\*)**

Executor.map() 返回值是一个迭代器，迭代器的\_\_next\_\_方法调用各个 future 的 result() 方法，得到各个 future 的结果而不是 future 本身。

\*iterables：可迭代对象，如列表等。每一次 func 执行，都会从 iterables 中取参数。

timeout：设置每次异步操作的超时时间

修改 Executor.map 调用，换成两个 for 循环，一个用于创建并排定 future，另一个用于获取 future 的结果

![](https://common.cnblogs.com/images/copycode.gif)

def download_many():

    with futures.ThreadPoolExecutor(max\_workers\=3) as executor:

        to\_do \= \[\] for cc in sorted(url\_list):
            future \= executor.submit(download\_one,cc)
            to\_do.append(future)

        result \= \[\] for future in futures.as\_completed(to\_do):
            res \= future.result()
            result.append(res)

![](https://common.cnblogs.com/images/copycode.gif)

**_executor.submit()_** 方法排定可调用对象的执行时间，然后返回一个 future，表示这个待执行的操作。

示例中的 future.result() 方法绝不会阻塞，因为 future 由 as_completed 函数产出。

▲ 同时在 future.result() 处使用 try 模块捕获异常

二、阻塞型 I/O 和 GIL

Cpython 解释器本身就不是线程安全的，因此有全局解释器锁（GIL），一次只允许使用一个线程执行 Python 字节码。因此，一个 Python 进程通常不能同时使用多个 CPU 核心。

标准库中所有执行阻塞型 I/O 操作的函数，在等待操作系统返回结果时都会释放 GIL。I/O 密集型 Python 程序能从中受益。

一个 Python 线程等待网络响应时，阻塞型 I/O 函数会释放 GIL，再运行一个线程。

三、ProcessPoolExecutor

　　ProcessPoolExecutor 和 ThreadPoolExecutor 类都实现了通用的 Executor 接口，因此使用 concurrent.futures 模块能特别轻松地把基于线程的方案转成基于进程的方案。

　　ThreadPoolExecutor.\_\_init\_\_方法需要 max_workers 参数，指定线程池中线程的数量。（10、100 或 1000 个线程）

　　**ProcessPoolExecutor 类**中这个参数是可选的，而且大多数情况下不使用，默认值是**os.cpu_count()**函数返回的 CPU 数量。四核 CPU，因此限制只能有 4 个并发。而线程池版本可以有上百个。

　　**ProcessPoolExecutor 类**把工作分配给多个 Python 进程处理，因此，如果需要做 CPU 密集型处理，使用这个模块能绕开 GIL，利用所有的 CPU 核心。

　　其**原理**是一个 ProcessPoolExecutor**创建了 N 个独立的 Python 解释器，N 是系统上面可用的 CPU 核数。** 

　　使用方法和 ThreadPoolExecutor 方法一样

![](https://common.cnblogs.com/images/copycode.gif)

from time import sleep,strftime from concurrent import futures def display(\*args): print(strftime('\[%H:%M:%S]'),end=' ') print(\*args) def loiter(n):
    msg \\= '{}loiter({}): doing nothing for {}s' display(msg.format('\\t'\*n,n,n))
    sleep(n\*2)
    msg \\= '{}loiter({}): done.' display(msg.format('\\t'\*n,n)) return n \*10

def main():
    display('Script starting...')
    executor \\= futures.ThreadPoolExecutor(max_workers=3)
    results \\= executor.map(loiter,range(5))
    display('result：',results)
    display('Waiting for individual results:') for i,result in enumerate(results):
        display('result {}:{}'.format(i,result))

main()

![](https://common.cnblogs.com/images/copycode.gif)

_**Executor.map**_函数返回结果的顺序与调用时开始的顺序一致。

如果第一个调用生成结果用时 10 秒，而其他调用只用 1 秒，代码会阻塞 10 秒，获取 map 方法返回的生成器产出的第一个结果。

在此之后，获取后续结果不会阻塞，因为后续的调用已经结束。

如果需要不管提交的顺序，只要有结果就获取，使用 Executor.submit() 和 Executor.as_completed() 函数。

四、显示下载进度条

　　TQDM 包特别易于使用。

from tqdm import tqdm import time for i in tqdm(range(1000)):
    time.sleep(.01)

　　tqdm 函数能处理任何可迭代的对象，生成一个迭代器。

　　使用这个迭代器时，显示进度条和完成全部迭代预计的剩余时间。

　　为了计算剩余时间，tqdm 函数要获取一个能使用 len 函数确定大小的可迭代对象，或者在第二个参数中指定预期的元素数量。

　　如：_**iterable = tqdm.tqdm(iterable, total=len(xx_list))**_

一、使用 asyncio 包处理并发

　　这个包主要使用事件循环的协程实现并发。

![](https://common.cnblogs.com/images/copycode.gif)

import asyncio import itertools import sys

@asyncio.coroutine def spin(msg):

    write,flush \= sys.stdout.write,sys.stdout.flush for char in itertools.cycle('|/-\\\\'):
        status \= char + ' ' +msg
        write(status)
        flush()
        write('\\x08'\*len(status)) try: yield from asyncio.sleep(.1) except asyncio.CancelledError: break write(' '\*len(status) + '\\x08'\*len(status))

@asyncio.coroutine def slow_function(): yield from asyncio.sleep(3) return 42 @asyncio.coroutine def supervisor():
    spinner \\= asyncio.async(spin('thinking')) print('spinner object:',spinner)
    result \\= yield from slow_function()
    spinner.cancel() return result def main():
    loop \\= asyncio.get_event_loop()
    result \\= loop.run_until_complete(supervisor())
    loop.close() print('Answer:',result)

![](https://common.cnblogs.com/images/copycode.gif)

　　（1）打算交给 asyncio 处理的协程要使用 @asyncio.coroutine 装饰。

　　（2）使用 yield from asyncio.sleep 代替 time.sleep，这样休眠不会阻塞事件循环。

　　（3）asyncio.async(...) 函数排定 spin 协程的运行时间，使用一个 Task 对象包装 spin 协程，并立即返回。

　　（4）获取事件循环的引用，驱动 supervisor 协程。

▲ 如果写成需要在一段时间内什么也不做，应该使用 yield from asyncio.sleep(DELAY)

asyncio.Task 对象差不多与 threading.Thread 对象等效，Task 对象像是实现协作式多任务的库（如：gevent）中的绿色线程（green thread）

获取的 Task 对象已经排定了运行时间，Thread 实例必须调用 start 方法，明确告知让他运行。

没有 API 能从外部终止线程，因为线程随时可能被中断，导致系统处于无效状态。

如果想要终止任务，使用 Task.cancel() 实例方法，抛出 CancelledError 异常。协程可以在暂停的 yield 处捕获这个异常，处理终止请求。

二、asyncio.Future 与 concurrent.futures.Future

　　asyncio.Future 与 concurrent.futures.Future 类的接口基本一致，不过实现方式不同，不可以互换。

　　future 只是调度执行某物的结果。

　　在 asyncio 包中，BaseEventLoop.create_task(...) 方法接收一个协程，排定它的运行时间，然后返回一个 asyncio.Task 实例，也是 asyncio.Future 类的实例，因为 Task 是 Future 的子类，用于包装协程。

　　asyncio.Future 类的目的是与 yield from 一起使用，所以通常不需要使用以下方法。

　　（1）无需调用 my_future.add_done_callback(...)，因为可以直接把想在 future 运行结束后执行的操作放在协程中 yield from my_future 表达式的后面，

　　（2）无需调用 my_future.result()，因为 yield from 从 future 中产出的值就是结果（result = yield from my_future）。

　　asyncio.Future 对象由 yield from 驱动，而不是靠调用这些方法驱动。

　　获取 Task 对象有两种方式：

　　（1）asyncio.async(coro_or_future, \*, loop=None)，

　　　　第一个参数如果是 Future 或者 Task 对象，返回。如果是协程，那么 async 函数会调用 loop.create_task(...) 方法创建 Task 对象。

　　（2）BaseEventLoop.create_task(coro)，

　　　　排定协程的执行时间，返回一个 asyncio.Task 对象。

三、asyncio 和 aiohttp

　　asyncio 包只直接支持 TCP 和 UDP。如果想使用 HTTP 或其他协议，那么要借助第三方包。

![](https://common.cnblogs.com/images/copycode.gif)

import asyncio import aiohttp

@asyncio.coroutine def get_flag(url):
    resp \\= yield from aiohttp.request('GET',url)
    data \\= yield from resp.read() return data

@asyncio.coroutine def download_one(url):
    data \\= yield from get_flag(url) return url def download_many():
    loop \\= asyncio.get_event_loop()
    to_do \\= \[download_one(url) for url in sorted(url_list)]
    wait_coro \\= asyncio.wait(to_do)
    res,\_ \\= loop.run_until_complete(wait_coro)
    loop.close() return len(res)

![](https://common.cnblogs.com/images/copycode.gif)

阻塞的操作通过协程实现，客户代码通过 yield from 把职责委托给协程，以便异步运行协程。

构建协程对象列表。

asyncio.wait 是一个协程，等传给它的所有协程运行完毕后结束。wait 函数默认行为。

loop.run_until_complete(wait_coro) 执行事件循环。直到 wait_coro 运行结束；时间循环运行的过程中，这个脚本会在这里阻塞。

asyncio.wait 函数运行结束后返回一个元组，第一个元素是一系列结束的 future，第二个元素是一系列未结束的 future。

（如果设置了 timeout 和 return_when 就会返回未结束的 future）

▲ 为了使用 asyncio 包，必须把每个访问网络的函数改成异步版，使用 yield from 处理网络操作，这样才能把控制权交还给事件循环。

总结：

　　（1）我们编写的协程链条始终是通过把最外层委派生成器传给 asyncio 包 API 中的某个函数（如 loop.run_until_complete(...)）驱动。

　　　　由 asyncio 包实现 next(...) 或. send(...)

　　（2）我们编写的协程链条始终通过 yield from 把职责委托给 asyncio 包中的某个协程函数或协程方法（yield from asyncio.sleep(...)），或者其他库中实现高层协议的协程（yield from aiohttp.request(...)），

　　　　**也就是说最内层的子生成器是库中真正执行 I/O 操作的函数，而不是我们自己编写的函数。** 

四、asyncio 与进度条结合

　　由 loop.run_until_complete 方法驱动，全部协程运行完毕后，这个函数会返回所有下载结果。

　　可是，为了更新进度条，各个协程运行结束后就要立即获取结果。

![](https://common.cnblogs.com/images/copycode.gif)

import asyncio import aiohttp from tqdm import tqdm import collections

@asyncio.coroutine def get_flag(url):
    resp \\= yield from aiohttp.request('GET',url)
    data \\= yield from resp.read() return data

@asyncio.coroutine def download_one(url,semaphore): try:
        with (yield from semaphore):
            data \\= yield from get_flag(url) except Exception as exc: ''''''
    else:
        save_data(data) return url

@asyncio.coroutine def download_coro(url_list,concur_req):

    counter \= collections.Counter()
    semaphore \= asyncio.Semaphore(concur\_req)

    to\_do \= \[download\_one(url,semaphore) for url in url\_list\]
    to\_do\_iter \= asyncio.as\_completed(to\_do)

    to\_do\_iter \=  tqdm(to\_do\_iter,total=len(url\_list)) for future in to\_do\_iter: try:
            res \= yield from future except Exception as exc: '''''' counter\[status\] += 1
    return counter def download\_many():
    loop \= asyncio.get\_event\_loop()
    coro \= download\_coro(url\_list,concur\_req)
    res \= loop.run\_until\_complete(coro)
    loop.close() return res    

![](https://common.cnblogs.com/images/copycode.gif)

　　（1）使用某种限流机制，防止向服务器发起太多并发请求，使用 ThreadPoolExecutor 类时可以通过设置线程池数量；

　　（2）asyncio.Semaphore 对象维护这一个内部计数器，把 semaphore 当做上下文管理器使用。保证任何时候都不会有超过 X 个协程启动。

　　（3）asyncio.as_completed(xxx)，获取一个迭代器，这个迭代器会在 future 运行结束后返回 future。

　　（4）迭代运行结束的 future，获取 asyncio.Future 对象的结果，使用 yield from，而不是 future.result() 方法。

　　（5）不能使用字典映射方式，因为 asyncio.as_completed 函数返回的 future 与传给 as_completed 函数的 future 可能不同。在 asyncio 包内部，我们提供的 future 会被替换成生成相同结果的 future。

五、使用 Executor 对象，防止阻塞事件循环

　　上述示例中，save_data(...)，会执行硬盘 I/O 操作，而这应该异步执行。

　　在线程版本中，save_data(...) 会阻塞 download_one 函数的线程，但是阻塞的只是众多工作线程中的一个。

　　阻塞型 I/O 调用在背后会释放 GIL，因此另一个线程可以继续。

　　但是在 asyncio 中，save_data(...) 函数阻塞了客户代码与 asyncio 事件循环共用的唯一线程，因此保存文件时，整个应用程序都会冻结。

　　asyncio 的事件循环在背后维护者一个 ThreadPoolExecutor 对象，我们可以调用 run_in_executor 方法，把可调用对象发给它执行。

![](https://common.cnblogs.com/images/copycode.gif)

@asyncio.coroutine def download_one(url,semaphore): try:
        with (yield from semaphore):
            data \\= yield from get_flag(url) except Exception as exc: ''''''
    else:
        loop \\= asyncio.get_event_loop()
        loop.run_in_executor(None, save_data, data) return url

![](https://common.cnblogs.com/images/copycode.gif)

　　（1）获取事件循环对象的引用。

　　（2）run_in_executor 方法的第一个参数是 Executor 实例；如果设为 None，使用事件循环的默认 ThreadPoolExecutor 实例。

　　（3）余下参数是可调用的对象，以及可调用对象的位置参数。

每次下载发起多次请求：

![](https://images.cnblogs.com/OutliningIndicators/ExpandedBlockStart.gif)

![](https://common.cnblogs.com/images/copycode.gif)

@asyncio.coroutine def get_flag(url):
    resp \\= yield from aiohttp.request('GET',url)
    data \\= yield from resp.read()
    json \\= yield from resp.json() return data

@asyncio.coroutine def download_one(url,semaphore): try:
        with (yield from semaphore):
            flag \\= yield from get_flag(url)
        with (yield from semaphore):
            country \\= yield from get_country(url) except Exception as exc: ''''''
    return url

![](https://common.cnblogs.com/images/copycode.gif)

六、使用 asyncio 包编写服务器 
 [https://www.cnblogs.com/5poi/p/11447626.html](https://www.cnblogs.com/5poi/p/11447626.html) 
 [https://www.cnblogs.com/5poi/p/11447626.html](https://www.cnblogs.com/5poi/p/11447626.html)
