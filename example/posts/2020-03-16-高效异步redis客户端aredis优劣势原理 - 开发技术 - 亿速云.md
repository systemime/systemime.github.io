---
title: 高效异步redis客户端aredis优劣势原理 - 开发技术 - 亿速云
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

这篇文章将为大家详细讲解有关高效异步[redis](https://www.yisu.com/redis/ "redis")客户端 aredis 优劣势原理，文章内容质量较高，因此小编分享给大家做个参考，希望大家阅读完这篇文章后对相关知识有一定的了解。

**背景**

aredis 是一款由同步的 redis 客户端 redis-py 改写而成的高效的异步 redis 客户端，在最新的 1.0.7 版本中完成了对于 redis 集群的支持。

**改动**

主要重写了底部建立连接和读取数据部分的代码，接口部分都向下兼容，便于使用者从 redis-py 的同步代码迁移到 async 和 await 的协程版本，详细文档请看 aredis 文档

**使用**  

安装 pip install aredis

具体姿势可以参阅项目文档和例子，接口向下兼容 redis-py，支持 Python 3.5 及以上版本，在最新的 1.0.7 版本中也支持 redis cluster，并且对于 Python 3.6 还支持各个数据类型的 scan iter 操作。

一个简单的例子如下所示：

> \>>> import aredis  
> >>> import asyncio  
> >>> r = aredis.StrictRedis(host='localhost', port=6379, db=0)  
> >>> loop = asyncio.get_event_loop()  
> >>> async def test():  
> >>> await r.set('foo', 'bar')  
> >>> print(await r.get('foo'))  
> >>> loop.run_until_complete(test())  
> b'bar'  

**优势**

使用了协程的异步客户端相较于同步客户端来说由于使用了 Python 的事件循环等多余代码，实际上运行效率是较低的，但是好处在于它不会阻塞你的 io，你可以在网络 io 进行的同时进行别的操作，aredis 比较适用于爬虫、http [服务器](https://www.yisu.com/ "服务器")等密集网络 io 的操作，使得你的代码不用等上 redis 操作的时间。

而相比于现有的两款支持 async/await 的 redis 客户端来说：

**aioredis:**  

aioredis 要求装上 hiredis ， 而 aredis 可以不需要相关依赖地运行，速度上两者持平且都可以使用 hiredis 来作为 parser ，用 uvloop 代替 asyncio 的 eventloop 来加速

**asyncio_redis:**  

asyncio_redis 使用了 Python 提供的 protocol 来进行异步通信，而 aredis 则使用 StreamReader 和 StreamWriter 来进行异步通信，在运行速度上两倍于 asyncio_redis ，附上 benchmark

而且以上两款客户端目前都还没有对于集群的支持，相对来说 aredis 的功能更为全面一些。

**劣势**  

现在对于编码的支持还不是那么完善，大部分命令还是用 bytes 类型作为返回值，且目前只支持 Python 3.5 及以上的版本

关于高效异步 redis 客户端 aredis 优劣势原理就分享到这里了，希望以上内容可以对大家有一定的帮助，可以学到更多知识。如果觉得文章不错，可以把它分享出去让更多的人看到。 
 [https://m.yisu.com/zixun/315303.html](https://m.yisu.com/zixun/315303.html) 
 [https://m.yisu.com/zixun/315303.html](https://m.yisu.com/zixun/315303.html)
