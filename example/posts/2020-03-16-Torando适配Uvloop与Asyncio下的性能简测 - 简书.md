---
title: Torando适配Uvloop与Asyncio下的性能简测 - 简书
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

[![](https://upload.jianshu.io/users/upload_avatars/11043/fb52e0e23e6b?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96/format/webp)
](https://www.jianshu.com/u/5qrPPM)

0.5242017.10.19 17:03:13 字数 1,381 阅读 7,934

Python 已经 relase3.6 版本了，尝试使用 PY3 来构建服务，由于比较熟悉 Tornado，故测试一下 tornado 在 Python3 下的常见用法。

业务代码通常需要访问三方服务和数据库，因此针对异步的 http 和数据库 io 进行测试。

### 事件循环

`Python3.5+` 的标准库`asyncio`提供了事件循环用来实现协程，并引入了`async/await`关键字语法以定义协程。Tornado 通过 yield 生成器实现协程，它自身实现了一个事件循环。由于一些三方库都是基于 asyncio 进行，为了更好的使用 python3 新特效带来的异步 IO，实际测试了 Tornado 在不同的事件循环中的性能，以及搭配三方库（motor，asyncpg，aiomysql）的方式。

#### tornado app 基本结构

一个基本的 tornado app 代码如下：

    import tornado.httpserver as httpserver
    import tornado.ioloop as ioloop
    import tornado.options as options
    import tornado.web as web

    options.parse_command_line()
    class IndexHandler(web.RequestHandler):
        def get(self):
            self.finish("It works")

    class App(web.Application):
        def __init__(self):
            settings = {
                'debug': True
            }
            super(App, self).__init__(
                handlers=[
                    (r'/', IndexHandler)
                ],
                **settings)

    if __name__ == '__main__':
        app = App()
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5010)
        ioloop.IOLoop.instance().start() 

使用 tornado 默认的事件循环驱动 app，IOLoop 会创建一个事件循环，用于响应 epoll 事件，并调用响应的 handler 处理请求。

#### 异步 http client

Tornado 提供了一个异步的 HTTPClient，用于 handler 中访问三方的 api，即使当前的三方 api 访问被阻塞了，也不会阻塞 tornado 响应其他的 handler。

    class GenHttpHandler(web.RequestHandler):
        @gen.coroutine
        def get(self):
            url = 'http://127.0.0.1:5000/'
            client = httpclient.AsyncHTTPClient()
            resp = yield client.fetch(url)
            print(resp.body)
            self.finish(resp.body) 

gen 是 tornado 提供的协程模块。python3 中还可以使用 async/await 的语法

    class AsyncHttpHandler(web.RequestHandler):
        async def get(self):
            url = 'http://127.0.0.1:5000/'
            client = httpclient.AsyncHTTPClient()
            resp = await client.fetch(url)
            print(resp.body)
            self.finish(resp.body) 

#### asyncio 事件循环

Aysnc 定义协程方式基本符合 tornado 的协程，但是毕竟不是全兼容了。例如 asyncio.sleep 将不会 work。

    class SleepHandler(web.RequestHandler):
        async def get(self):
            print("hello tornado")
            await asyncio.sleep(5)
            self.write('It works!') 

想要上面的 asyncio.sleep 能够正常，需要替换 I 使用 asyncio 的事件循环替换 ioloop。

    if __name__ == '__main__':
        tornado_asyncio.AsyncIOMainLoop().install()
        app = App()
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5020)
        asyncio.get_event_loop().run_forever() 

使用 tornado_asyncio.AsyncIOMainLoop() 可以替换默认的 ioloop。

#### uvloop 事件循环

除了标准库 asyncio 的事件循环，社区使用 Cython 实现了另外一个事件循环 uvloop。用来取代标准库。号称是性能最好的 python 异步 IO 库。使用 uvloop 的方式如下：

    if __name__ == '__main__':
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        tornado_asyncio.AsyncIOMainLoop().install()
        app = App()
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5030)
        asyncio.get_event_loop().run_forever() 

由于 uvloop 依赖 cython，因此需要按照 cython，两者都可以使用 pip 直接按照。

### 三种事件循环的性能

三种事件循环中，ioloop 对 asyncio.sleep 兼容性不好。主要考察后面两者事件循环的性能。测试接口类型为三种：

1\. 单纯的返回一个子串  
2. 异步 httpclient 性能  
3. 数据库读写性能

#### 单纯返回子串

##### IOLoop

使用 100 并发连接，10000 请求量压测

    ab -k -c100 -n10000 http://127.0.0.1:5010/

    Server Software:        TornadoServer/4.5.1
    Server Hostname:        127.0.0.1
    Server Port:            5010

    Document Path:          /
    Document Length:        8 bytes

    Concurrency Level:      100
    Time taken for tests:   5.615 seconds
    Complete requests:      10000
    Failed requests:        0
    Keep-Alive requests:    10000
    Total transferred:      2260000 bytes
    HTML transferred:       80000 bytes
    Requests per second:    1780.84 [#/sec] (mean)
    Time per request:       56.153 [ms] (mean)
    Time per request:       0.562 [ms] (mean, across all concurrent requests)
    Transfer rate:          393.04 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        0    0   0.2      0       3
    Processing:     2   56   5.9     56     154
    Waiting:        2   56   5.9     56     154
    Total:          5   56   5.8     56     158 

Qps 为 1780.84

使用 wrk 压测的结果，并发 500 线程连接，持续测试一分钟：

    ➜  ~ wrk -t12 -c500 -d60 http://127.0.0.1:5010/
    Running 1m test @ http://127.0.0.1:5010/
      12 threads and 500 connections
      Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency   284.66ms   57.85ms 422.16ms   85.62%
        Req/Sec   139.33     94.69   696.00     64.84%
      99270 requests in 1.00m, 19.12MB read
      Socket errors: connect 0, read 582, write 0, timeout 0
    Requests/sec:   1651.92
    Transfer/sec:    325.87KB 

##### Asyncio

    Concurrency Level:      100
    Time taken for tests:   5.616 seconds
    Complete requests:      10000
    Failed requests:        0
    Keep-Alive requests:    10000
    Total transferred:      2260000 bytes
    HTML transferred:       80000 bytes
    Requests per second:    1780.69 [#/sec] (mean)
    Time per request:       56.158 [ms] (mean)
    Time per request:       0.562 [ms] (mean, across all concurrent requests)
    Transfer rate:          393.00 [Kbytes/sec] received 

qps 1780.69

Wrk 压测结果

    ➜  ~ wrk -t12 -c500 -d60 http://127.0.0.1:5020/
    Running 1m test @ http://127.0.0.1:5020/
      12 threads and 500 connections
      Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency   265.34ms   32.16ms 453.76ms   83.32%
        Req/Sec   157.85    104.58   696.00     63.36%
      108364 requests in 1.00m, 20.88MB read
      Socket errors: connect 0, read 458, write 2, timeout 0
    Requests/sec:   1803.34
    Transfer/sec:    355.74KB 

##### uvloop

uvloop 的测试结果

    Concurrency Level:      100
    Time taken for tests:   5.612 seconds
    Complete requests:      10000
    Failed requests:        0
    Keep-Alive requests:    10000
    Total transferred:      2260000 bytes
    HTML transferred:       80000 bytes
    Requests per second:    1781.98 [#/sec] (mean)
    Time per request:       56.117 [ms] (mean)
    Time per request:       0.561 [ms] (mean, across all concurrent requests)
    Transfer rate:          393.29 [Kbytes/sec] received 

Wrk 压测结果

    ➜  ~ wrk -t12 -c500 -d60 http://127.0.0.1:5030/
    Running 1m test @ http://127.0.0.1:5030/
      12 threads and 500 connections
      Thread Stats   Avg      Stdev     Max   +/- Stdev
        Latency   272.23ms   47.65ms 457.63ms   87.26%
        Req/Sec   148.17    103.62   570.00     63.33%
      104625 requests in 1.00m, 20.16MB read
      Socket errors: connect 0, read 567, write 0, timeout 0
    Requests/sec:   1740.76
    Transfer/sec:    343.39KB 

#### 异步 httpclient 性能

异步的 httpclient 性能指在 handler 中访问别的 api，如三方请求。测试的性能大致如下：

| -   | loop   | asyncio | uvloop |
| --- | ------ | ------- | ------ |
| ab  | 571.12 | 462.64  | 534.99 |
| wrk | 448.11 | 444.63  | 411.19 |

#### 结论

通过一些压测，在三种的横向对比中，其性能大致在一个数量级上，并没有拉开很大的距离，在性能上使用哪一个差不多。考虑到三方库兼容标准的异步 IO，并且 uvloop 驱动的另外一些框架 sanic 和 japronto 都比较不错，并且还可以使用 cython 加速，因此下面针对数据库驱动，使用事件循环为 uvloop。

### 数据库测试

Python 中最常用的是 mysqldb，可是 mysqldb 不支持 python3。python3 中 mysql 驱动以 pymysql 为基础的 aiomysql。而 postgresql 和 mongodb 都提供了基于 asyncio 事件循环的驱动。

#### asyncpg

对于 postgresql，比较好的驱动是 asyncpg，维护的活跃度和性能都比 aiopg 更好。使用 asyncpg 的方式如下：

     class DatabaseHandler(web.RequestHandler):
        async def get(self):
            conn = await asyncpg.connect('postgresql://postgres@localhost/test')

            
            rows = await conn.fetchrow('select * from public.user')
            print(rows[0])
            await conn.close()

            self.finish("ok")

    class PoolHandler(web.RequestHandler):
        async def get(self):
            pool = self.application.pool
            async with pool.acquire() as connection:
                
                async with connection.transaction():
                    
                    rows = await connection.fetch("SELECT * FROM public.user ")
                    
                    print(rows)

            self.finish("ok")

    class App(web.Application):
        def __init__(self, pool):
            settings = {
                'debug': True
            }
            self._pool = pool
            super(App, self).__init__(
                handlers=[
                    (r'/', IndexHandler),
                    (r'/db', DatabaseHandler),
                    (r'/pool', PoolHandler),
                ],
                **settings)

        @property
        def pool(self):
            return self._pool

    async def init_db_pool():
        return await asyncpg.create_pool(database='test',
                                         user='postgres')

    def init_app(pool):
        app = App(pool)
        return app

    if __name__ == '__main__':
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        tornado_asyncio.AsyncIOMainLoop().install()

        loop = asyncio.get_event_loop()
        pool = loop.run_until_complete(init_db_pool())
        app = init_app(pool=pool)
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5040)
        loop.run_forever() 

一种方式使用了短链接，即每一个请求，handler 会创建一个数据库连接，完成查询再关闭，另外一种方式则是使用数据库连接池。当超过连接池的访问，handler 会阻塞，但是不会阻塞整个服务。

#### aiomysql

    class PoolHandler(web.RequestHandler):
        async def get(self):
            pool = self.application.pool
            async with pool.acquire() as conn:
                async with conn.cursor() as cur:
                    await cur.execute("SELECT * FROM users_account LIMIT 1")
                    ret = await cur.fetchone()
                    print(ret)

            self.finish("ok")

    class App(web.Application):
        def __init__(self, pool):
            settings = {
                'debug': True
            }
            self._pool = pool
            super(App, self).__init__(
                handlers=[
                    (r'/pool', PoolHandler),
                ],
                **settings)

        @property
        def pool(self):
            return self._pool

    async def init_db_pool(loop):

        return await aiomysql.create_pool(host='127.0.0.1', port=3306,
                                          user='root', password='root',
                                          db='hydra', loop=loop)

    def init_app(pool):
        app = App(pool)
        return app

    if __name__ == '__main__':
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        tornado_asyncio.AsyncIOMainLoop().install()

        loop = asyncio.get_event_loop()
        pool = loop.run_until_complete(init_db_pool(loop=loop))
        app = init_app(pool=pool)
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5070)
        loop.run_forever() 

#### motor

Mongodb 的驱动为 motor，它也实现了对 asyncio 的支持，其使用方式如下：

     class MongodbHandler(web.RequestHandler):
        async def get(self):
            ret = await self.application.motor_client.hello.find_one()
            
            print(ret)
            self.finish("It works !")

    class App(web.Application):
        def __init__(self):
            settings = {
                'debug': True
            }
            super(App, self).__init__(
                handlers=[
                    (r'/', IndexHandler),
                    (r'/mongodb', MongodbHandler),

                ],
                **settings)

        @property
        def motor_client(self):
            client = motor_asyncio.AsyncIOMotorClient('mongodb://localhost:27017')
            return client['test']

    if __name__ == '__main__':
        asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
        tornado_asyncio.AsyncIOMainLoop().install()
        app = App()
        server = httpserver.HTTPServer(app, xheaders=True)
        server.listen(5060)
        asyncio.get_event_loop().run_forever() 

#### 读取数据的性能

ab -c100 -n10000

Wrk -t12 -c100 -d60s

|     | asyncpg-db | asyncpg-pool | aiomysql | motor  |
| --- | ---------- | ------------ | -------- | ------ |
| ab  | 305.49     | 898.84       | 669.75   | 236.82 |
| wrk | 281.60     | 819.23       | 655.58   | 252.51 |

压测中，使用 wrk 500 的连接，压测 db 的时候，会出现连接异常（Too Many Connection）。mongodb 也会出现`Can't assign requested address`的异常。

因为数据库读写都是 non-block，因此 db 和 mongodb 模式都会因请求的增长而增长，当瞬时达到最大连接数将会 raise 异常。而 pool 的方式会等待连接释放，再发起数据库查询。而且性能最好。aiomysql 的连接池方式与 pq 类似。

> 在同步带 mysql 驱动中，经常维护一个 mysql 长连接。而异步的驱动则不能这样，因为一个连接阻塞了，另外的协程还是无法读取这个连接。最好的方式还是使用连接池管理连接。

### 结论

Tornado 的作者也指出过，他的测试过程中，使用 asyncio 和 tornado 自带的 epoll 事件循环性能差不多。并且 tornado5.0 会考虑完全吸纳 asyncio。在此之前，使用 tornado 无论是使用自带的事件循环还是 asyncio 活着 uvloop，在性能方面上都差不不大。需要兼容数据库或 http 库的时候，使用 uvloop 的驱动方式，兼容性最好~

更多精彩内容下载简书 APP

"小礼物走一走，来简书关注我"

[![](https://cdn2.jianshu.io/assets/default_avatar/5-33d2da32c552b8be9a0548c7a4576607.jpg)
](https://www.jianshu.com/u/8db7b80e0012)共 1 人赞赏

[![](https://upload.jianshu.io/users/upload_avatars/11043/fb52e0e23e6b?imageMogr2/auto-orient/strip|imageView2/1/w/100/h/100/format/webp)
](https://www.jianshu.com/u/5qrPPM)

总资产 558 (约 35.95 元) 共写了 19.5W 字获得 2,695 个赞共 2,369 个粉丝

### 被以下专题收入，发现更多相似内容

### 推荐阅读[更多精彩内容](https://www.jianshu.com/)

-   环境管理管理 Python 版本和环境的工具。p–非常简单的交互式 python 版本管理工具。pyenv–简单的 Pyth...
-   GitHub 上有一个 Awesome - XXX 系列的资源整理, 资源非常丰富，涉及面非常广。awesome-p...

    [![](https://upload.jianshu.io/users/upload_avatars/1293367/91ccecc113ea.jpeg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    若与](https://www.jianshu.com/u/30c5a2b50c1d)阅读 17,102 评论 4 赞 419

    [![](https://upload-images.jianshu.io/upload_images/1293367-bf614dc56c72a793.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/9c6ae64a1bd7)
-   title 标题: A Web Crawler With asyncio Coroutinesauthor 作者: A...
-   就是个垃圾，总以为自己牛逼的很，今天不管你是真心想帮我还是为了在我面前显示你牛逼，就那么随意的我要好好做的事...
-   痛在自己身上 爱在自己身上 都说旁观者清当局者迷 其实 局中人比任何人都明白自己的咎由自取 也比任何人都明白曾有多...
       [![](https://upload.jianshu.io/users/upload_avatars/6619748/576ae1fc-1e47-474a-8347-1258f3cc26b1.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
       花妖姬](https://www.jianshu.com/u/ebda211ccf76)阅读 79 评论 0 赞 0
       [![](https://upload-images.jianshu.io/upload_images/6619748-81e6f81096b740a0.jpeg?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
       ](https://www.jianshu.com/p/c17784be3805) 
    [https://www.jianshu.com/p/6d6fa94a01ef](https://www.jianshu.com/p/6d6fa94a01ef) 
    [https://www.jianshu.com/p/6d6fa94a01ef](https://www.jianshu.com/p/6d6fa94a01ef)
