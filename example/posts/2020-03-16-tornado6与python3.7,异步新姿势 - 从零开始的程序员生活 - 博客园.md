---
title: tornado6与python3.7,异步新姿势 - 从零开始的程序员生活 - 博客园
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

copy

\`|  | **auth** = "aleimu" |
\|  \| **doc** = "学习 tornado6.0+ 版本与 python3.7+" |

|  | import time |
|  | import asyncio |
|  | import tornado.gen |
|  | import tornado.web |
|  | import tornado.ioloop |
|  | import tornado.httpserver  # tornado 的 HTTP 服务器实现 |
|  | from tornado.options import define, options |
|  | from tornado.httpclient import HTTPClient, AsyncHTTPClient |
|  | from requests import get |

|  | settings = {'debug': True} |
|  | url = "[http://127.0.0.1:5000/](http://127.0.0.1:5000/)"  # 这是另个服务, 请求 5s 后返回结果 |

|  | # RuntimeError: Cannot run the event loop while another loop is running |
|  | # 解释: HTTPClient 内部写 loop.run_xxx，因为那是启动 event loop 的命令，通常只再最最最外面用一次，之后的代码都应假设 loop 已经在运转了。 |
|  | def synchronous_fetch(url): |
|  |     print("synchronous_fetch") |
|  |     try: |
|  |         http_client = HTTPClient() |
|  |         time.sleep(5) |
|  |         response = http_client.fetch(url) |
|  |         print(response.body) |
|  |     except Exception as e: |
|  |         print("Error:" + str(e)) |
|  |         return str(e) |
|  |     http_client.close() |
|  |     return response.body |

|  | # 替代 synchronous_fetch 的同步请求, 没有内置 loop.run_xxx |
|  | def synchronous_get(url): |
|  |     response = get(url) |
|  |     time.sleep(5) |
|  |     print("synchronous_fetch") |
|  |     return response.text |

|  | # 简单的模拟异步操作, 这里之后应该替换成各种异步库的函数 |
|  | async def sleep(): |
|  |     print("start sleep") |
|  |     await asyncio.sleep(5) |
|  |     print("end sleep") |

|  | # 异步请求 |
|  | async def asynchronous_fetch(url): |
|  |     http_client = AsyncHTTPClient() |
|  |     response = await http_client.fetch(url) |
|  |     print("asynchronous_fetch") |
|  |     return response.body |

|  | # 测试 |
|  | class MainHandler(tornado.web.RequestHandler): |
|  |     def get(self): |
|  |         self.write("Hello, world:%s" % self.request.request_time()) |
|  |         self.finish() |
|  |         print("not finish!") |
|  |         return |

|  | # 同步阻塞 |
|  | class synchronous_fetcher(tornado.web.RequestHandler): |
|  |     def get(self): |
|  |         self.write("%s,%s" % (synchronous_fetch(url), self.request.request_time())) |

|  | # 同步阻塞 |
|  | class synchronous_geter(tornado.web.RequestHandler): |
|  |     def get(self): |
|  |         self.write("%s,%s" % (synchronous_get(url), self.request.request_time())) |

|  | # 异步阻塞, 我以为 curl "127.0.0.1:8888/1" 总耗时希望为 5s, 可是是 25s, 看来异步没搞好, 以下的函数都是基于此改进的 |
|  | class asynchronous_fetcher_1(tornado.web.RequestHandler): |
|  |     async def get(self): |
|  |         body = await asynchronous_fetch(url) |
|  |         for i in range(3): |
|  |             print("skip %s" % i) |
|  |             await tornado.gen.sleep(5) |
|  |         time.sleep(5) |
|  |         print("end request") |
|  |         self.write("%s,%s" % (body, self.request.request_time())) |

|  | # curl "127.0.0.1:8888/1" |
|  | # b'{\\n"data":"123"\\n}\\n',25.026000022888184 |

|  | # 异步阻塞, 效果同上, 这里只是证明 tornado.gen.sleep(5) 和 asyncio.sleep(5) 效果一致 |
|  | class asynchronous_fetcher_2(tornado.web.RequestHandler): |
|  |     async def get(self): |
|  |         body = await asynchronous_fetch(url)  # 关注协程完成后返回的结果 |
|  |         for i in range(3): |
|  |             print("skip %s" % i) |
|  |             await sleep() |
|  |         time.sleep(5) |
|  |         print("end request") |
|  |         self.write("%s,%s" % (body, self.request.request_time())) |

|  | # curl "127.0.0.1:8888/2" |
|  | # b'{\\n"data":"123"\\n}\\n',25.039999961853027 |

|  | # 异步非阻塞 - 将部分异步操作放入组中, 实现 loop 管理 |
|  | class asynchronous_fetcher_3(tornado.web.RequestHandler): |
|  |     async def get(self): |
|  |         body = await asynchronous_fetch(url) |
|  |         await asyncio.wait([sleep() for i in range(3)]) |
|  |         print("end request") |
|  |         self.write("%s,%s" % (body, self.request.request_time())) |

|  | # curl "127.0.0.1:8888/3" |
|  | # b'{\\n"data":"123"\\n}\\n',10.001000165939331 |

|  | # 异步非阻塞 - 将所有异步操作放入组中, 实现 loop 管理 |
|  | class asynchronous_fetcher_4(tornado.web.RequestHandler): |
|  |     async def get(self): |
|  |         task_list = [sleep() for i in range(3)] \|
|  |         task_list.append(asynchronous_fetch(url)) |
|  |         body = await asyncio.wait(task_list)  # 将所有异步操作的结果返回, 但是是无序的, 要是需要返回结果的话解析起来比较麻烦 |
|  |         print("end request:", body) |
|  |         # print(type(body), len(body),type(body[0]),len(body[0]),type(body[0])) |
|  |         self.write("%s,%s" % ([x.result() for x in body\[0\] if x.result() is not None][0], |
|  |                               self.request.request_time())) |
|  | # curl "127.0.0.1:8888/4" |
|  | # b'{\\n"data":"123"\\n}\\n',5.006999969482422 |

|  | def make_app(): |
|  |     return tornado.web.Application(\[ |
|  |         (r"/", MainHandler), |
|  |         (r"/1", asynchronous_fetcher_1), |
|  |         (r"/2", asynchronous_fetcher_2), |
|  |         (r"/3", asynchronous_fetcher_3), |
|  |         (r"/4", asynchronous_fetcher_4), |
|  |         (r"/5", synchronous_fetcher), |
|  |         (r"/6", synchronous_geter), |

|  |     ], \*\*settings) |

|  | if **name** == "**main**": |
|  |     print("server start!") |
|  |     app = make_app() |
|  |     server = tornado.httpserver.HTTPServer(app) |
|  |     server.bind(8888) |
|  |     server.start(1)  # forks one process per cpu,windows 上无法 fork, 这里默认为 1 |
|  |     tornado.ioloop.IOLoop.current().start() |\` 

copy

`
|  | 1.Tornado 使用单线程事件循环, 写的不好, 会阻塞的非常严重, 比如 synchronous_geter |
|  | 2.flask+celery 可以完成常见的异步任务 |
|  | 3.await 语法只能出现在通过 async 修饰的函数中 |
|  | 4. 可以看到 tornado.gen.coroutine, tornado.concurrent.run_on_executor,tornado.web.asynchronous,tornado.gen.coroutine 等这些装饰器都不在经常使用了, 都由 async 和 await 代替 |`

copy

`
|  | https://zhuanlan.zhihu.com/p/27258289   # Python async/await 入门指南 |
|  | http://www.tornadoweb.org/en/stable/guide/intro.html    # 这个官网 |
|  | https://www.osgeo.cn/tornado/guide/intro.html   #Tornado 1.0 - Tornado 6.0 的更新说明, 以及 6.0 版本的中文文档, 适合英语不好的人阅读 |
|  | https://www.osgeo.cn/tornado/releases/v5.0.0.html#  在 Python 3 上， IOLoop 总是包装 asyncio 事件循环。 |`

On Python 3, IOLoop is always a wrapper around the asyncio event loop.  
这是我重新复习 tornado 的原因, tornado 放弃了之前自己实现的 tornado.ioloop, 全面拥抱 asyncio 的 event_loop. 这个改动是非常大的,  
而且阅读 tornado 的源码可以发现其中大部分函数都支持了类型检验, 和返回值提示, 值得阅读.

本文作者：从零开始的程序员生活

本文链接：[https://www.cnblogs.com/lgjbky/p/10863812.html](https://www.cnblogs.com/lgjbky/p/10863812.html)

版权声明：本作品采用知识共享署名 - 非商业性使用 - 禁止演绎 2.5 中国大陆许可协议进行许可。 
 [https://www.cnblogs.com/lgjbky/p/10863812.html](https://www.cnblogs.com/lgjbky/p/10863812.html) 
 [https://www.cnblogs.com/lgjbky/p/10863812.html](https://www.cnblogs.com/lgjbky/p/10863812.html)
