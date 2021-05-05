---
title: Python 多进程+协程的例子 - SegmentFault 思否
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

为什么要多进程 + 协程？因为这可以[获得极高的性能](https://www.liaoxuefeng.com/wiki/1016959663602400/1017968846697824)，建议先通读 [Python 黑魔法 --- 异步 IO（ asyncio） 协程](https://www.jianshu.com/p/b5e347b3a17c) 一文。

废话不多说，上代码。

<!--more-->

     import asyncio
    import multiprocessing
    import os
    import time
    from multiprocessing import Manager

    class BaiJiaHao():

        async def get_author(self, rec):
            """
            协程代码
            """
            print('enter get author,wait for: %d' % rec['num'])
            
            await asyncio.sleep(rec['num'])
            
            return rec


        def run(self):
            
            
            list = [{'title': 'title1', 'num': 2},
                    {'title': 'title2', 'num': 1},
                    {'title': 'title3', 'num': 3},
                    {'title': 'title4', 'num': 8},
                    {'title': 'title5', 'num': 2},
                    {'title': 'title6', 'num': 5},
                    {'title': 'title7', 'num': 7},
                    {'title': 'title8', 'num': 3},
                    {'title': 'title9', 'num': 4},
                    {'title': 'title10', 'num': 3},
                    {'title': 'title11', 'num': 5},
                    ]
            result = run_get_author_in_multi_process(list)
            print('result', result)

    def get_chunks(iterable, chunks=1):
        """
        此函数用于分割若干任务到不同的进程里去
        """
        lst = list(iterable)
        return [lst[i::chunks] for i in range(chunks)]

    def run_get_author(lists, queue):
        """
        这个就是子进程运行的函数，接收任务列表和用于进程间通讯的Queue
        """
        print('exec run_get_author.child process id : %s, parent process id : %s' % (os.getpid(), os.getppid()))
        
        loop = asyncio.new_event_loop()
        
        spider = BaiJiaHao()
        tasks = [loop.create_task(spider.get_author(rec)) for rec in lists]
        
        loop.run_until_complete(asyncio.wait(tasks))
        
        for task in tasks:
            queue.put(task.result())

    def run_get_author_in_multi_process(task_lists):
        """
        父进程函数，主要是分割任务并初始化进程池，启动进程并返回结果
        """
        
        
        process_count = multiprocessing.cpu_count()
        print('process_count: %d' % process_count)
        split_lists = get_chunks(task_lists, process_count)
        pool = multiprocessing.Pool(process_count)
        queue = Manager().Queue()
        for lists in split_lists:
            pool.apply_async(run_get_author, args=(lists, queue,))
        pool.close()
        pool.join()
        result = []
        
        while not queue.empty():
            result.append(queue.get())
        return result

    now = lambda : time.time()

    if __name__ == '__main__':
        start = now()
        spider = BaiJiaHao()
        spider.run()
        print('done','TIME: ', now() - start)

运行结果：

![](https://segmentfault.com/img/remote/1460000038437454) 
 [https://segmentfault.com/a/1190000038437451](https://segmentfault.com/a/1190000038437451) 
 [https://segmentfault.com/a/1190000038437451](https://segmentfault.com/a/1190000038437451)
