---
title: python asyncio aiohttp 异步下载 完整例子
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

asyncio 基础:[python asyncio 协程](https://blog.csdn.net/dashoumeixi/article/details/81001681)<br />之前完整的说明了并发下载例子: [并发下载](https://blog.csdn.net/dashoumeixi/article/details/80938327)<br />使用了aiohttp,<br />注意, 下面写文件没有使用异步写入.一般情况下可以配合ThreadPoolExecutor来结合写入文件 : [关于aiohttp下载大文件的方式](https://blog.csdn.net/dashoumeixi/article/details/88845137)
```
1. import os,sys,time,asyncio,aiohttp
2. import tqdm
3. FLAGS = ('CN IN US ID BR PK NG BD RU JP '
4. 'MX PH VN ET EG DE IR TR CD FR').split()
5. BASE_URL = 'http://flupy.org/data/flags'        #下载url
6. DEST_DIR = 'downloads/'                           #保存目录
7. #获取链接,下载文件
8. async def fetch(session:aiohttp.ClientSession,url:str,path:str,flag:str):
9.     print(flag, ' 开始下载')
10. async with session.get(url) as resp:
11. with open(path,'wb') as fd:
12. while 1:
13.                 chunk = await resp.content.read(1024)    #每次获取1024字节
14. if not chunk:
15. break
16.                 fd.write(chunk)
17. return flag
18. 
19. async def begin_download(sem,session:aiohttp.ClientSession,url:str,path:str,flag:str):
20. #控制协程并发数量
21. with (await sem):
22. return await fetch(session,url,path,flag)
23. 
24. async def download(sem:asyncio.Semaphore):
25.     tasks = []
26. async with aiohttp.ClientSession() as session:
27. for flag in FLAGS:
28. #创建路径以及url
29.             path = os.path.join(DEST_DIR, flag.lower() + '.gif')
30.             url = '{}/{cc}/{cc}.gif'.format(BASE_URL, cc=flag.lower())
31. #构造一个协程列表
32.             tasks.append(asyncio.ensure_future(begin_download(sem,session, url, path, flag)))
33. #等待返回结果
34.         tasks_iter = asyncio.as_completed(tasks)
35. #创建一个进度条
36.         fk_task_iter = tqdm.tqdm(tasks_iter,total=len(FLAGS))
37. for coroutine in fk_task_iter:
38. #获取结果
39.             res = await coroutine
40.             print(res, '下载完成')
41. 
42. #创建目录
43. os.makedirs(DEST_DIR,exist_ok=True)
44. #获取事件循环
45. lp = asyncio.get_event_loop()
46. start = time.time()
47. #创建一个信号量以防止DDos
48. sem = asyncio.Semaphore(4)
49. lp.run_until_complete(download(sem))
50. end = time.time()
51. lp.close()
52. print('耗时:',end-start)
```
 <br />在写文件那块代码可以使用 run_in_executor 这个函数执行，事件循环中包含一个默认的线程池(ThreadPoolExecutor).<br />`run_in_executor`(_executor_, _func_, _*args_) 原型 . _executor == None, 使用默认的. 可以自己创建一个;_<br />具体代码:
```
1. #线程运行的函数
2. def save_file(fd:io.BufferedWriter,chunk):
3.     fd.write(chunk)
4. #获取链接,下载文件
5. async def fetch(session:aiohttp.ClientSession,url:str,path:str,flag:str):
6.     print(flag, ' 开始下载')
7. async with session.get(url) as resp:
8. with open(path,'wb') as fd:
9. while 1:
10.                 chunk = await resp.content.read(8192)
11. if not chunk:
12. break
13.                 lp = asyncio.get_event_loop()
14.                 lp.run_in_executor(None,save_file,fd,chunk)
15. # fd.write(chunk)
16. return flag
```
 
