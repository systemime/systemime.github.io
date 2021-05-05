---
title: python - 使用多进程和多线程通过asyncio提高“发送100,000个请求”的速度 - IT工具网
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

首先，我想用一个连接尽快发送多个请求。下面的代码运行良好且快速，但我希望它超越异步。回到我的问题，是否有可能使用多线程或多处理并行运行这个程序。我听说你可以使用 threadpoolexecutor 或 processpoolexecutor。  

```null
import random
import asyncio
from aiohttp import ClientSession
import time
from concurrent.futures import ProcessPoolExecutor

async def fetch(sem,url, session):
    async with sem:
        async with session.get(url) as response:
            return await response.read()
async def run(r):
    url = "http://www.example.com/"
    tasks = []
    sem = asyncio.Semaphore(1000)
    async with ClientSession() as session:
        for i in range(r):
            task = asyncio.ensure_future(fetch(sem, url.format(i), session)) 
            tasks.append(task)
        responses = asyncio.gather(*tasks)
        await responses
if __name__ == "__main__":
    number = 10000
    loop = asyncio.get_event_loop()
    start = time.time()
    loop.run_until_complete(run(number))
    end = time.time() - start
    print (end)
```

通过测试，它在 49 秒内成功地发送了大约 10 公里的请求。  
我需要快点，有什么建议吗？（线程、进程）

**最佳答案**

processpoolexecutor 是一种进行真正多处理的方法。  
对于您的用例，基本上就像您同时启动多个程序副本一样。如果您的计算机上有所需的带宽和 cpu，那么您应该能够使用 processpoolexecutor 将性能提高 4（max_workers=4）  
但是，您需要在每个子进程中都有一个异步事件循环，这样您就可以执行以下操作：  

```null
def main(n):
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run(n))


with concurrent.futures.ProcessPoolExecutor(max_workers=4) as exc:
    exc.submit(main, 2500)
    exc.submit(main, 2500)
    exc.submit(main, 2500)
    exc.submit(main, 2500)
```

作为`run`函数的附带说明：也不需要使用`ensure_future`或任务，`async def`函数的结果是一个协程，您可以直接等待或传递到`asyncio.gather`

```null
async def run(r):
    url = "http://www.example.com/"
    sem = asyncio.Semaphore(1000)
    async with ClientSession() as session:
        coros = [fetch(sem, url.format(i), session) for i in range(r)]
        await asyncio.gather(*coros)
```

 [https://www.coder.work/article/1264877](https://www.coder.work/article/1264877) 
 [https://www.coder.work/article/1264877](https://www.coder.work/article/1264877)
