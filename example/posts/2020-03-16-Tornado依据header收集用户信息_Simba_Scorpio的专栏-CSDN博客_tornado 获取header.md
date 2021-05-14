---
title: Tornado依据header收集用户信息_Simba_Scorpio的专栏-CSDN博客_tornado 获取header
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

最近学习了用 tornado 编写一段小程序，根据 HTTP header 收集客户端相关信息：是否手机、操作系统、浏览器等信息。  

先上代码，简单实用：

```python
import tornado.httpserverclass IndexHandle(tornado.web.RequestHandler):    	self.write("-------method:\n")        self.write(self.request.method)        self.write("\n-------uri:\n")        self.write(self.request.uri)        self.write("\n-------path:\n")        self.write(self.request.path)        self.write("\n-------query:\n")        self.write(self.request.query)        self.write("\n-------version:\n")        self.write(self.request.version)        self.write("\n-------headers:\n")        self.write(self.request.headers)        self.write("\n-------body:\n")        self.write(self.request.body)        self.write("\n-------remote_ip:\n")        self.write(self.request.remote_ip)        self.write("\n-------protocol:\n")        self.write(self.request.protocol)        self.write("\n-------host:\n")        self.write(self.request.host)        self.write("\n-------arguments:\n")        self.write(self.request.arguments)        self.write("\n-------query_arguments:\n")        self.write(self.request.query_arguments)        self.write("\n-------body_arguments:\n")        self.write(self.request.body_arguments)        self.write("\n-------files:\n")        self.write(self.request.files)        self.write("\n-------cookies:\n")        self.write(self.request.cookies)if __name__ == "__main__":    tornado.options.parse_command_line()    __app__=tornado.web.Application(handlers=[(r'/', IndexHandle)], debug=True)    __http_server__=tornado.httpserver.HTTPServer(__app__)    __http_server__.listen(8000)    tornado.ioloop.IOLoop.instance().start()```

可以看见通过调用self.request获取了tornado.httputil.HTTPServerRequest 对象实例，实例里有headers(信息最丰富的)字典类型的属性，客户的信息就在里面！

以下是我浏览器端的显示结果：

![](https://img-blog.csdn.net/20141115140319390?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvU2ltYmFfU2NvcnBpbw==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)
  
让我们来看一下headers里的信息：

**1."Accept-Language": "zh-CN,zh;q=0.8"**

 Accept-Language可以说明用户的默认语言设置，它可以通过逗号分隔携带多国语言。第一个是首选的语言，其他语言会携带一个"q"值，来表示用户对这个语言的喜好程度(0-1)。在这里，"zh-CN,zh"是我默认的语言设置，zh-CN是简体中文，zh是中文，优先支持简体中文。"q=0.8"表示我对此语言的喜欢程度很高。

**2."Accept-Encoding": "gzip,deflate,sdch"**

 大部分现代浏览器会把浏览器所支持的压缩格式(gzip)报告给服务器，这时浏览器就会把压缩过的HTML发送给浏览器，减少文件大小，以节省下载时间和宽带。

**3."Connection": "keep-alive"**

 表明服务器是有状态服务器(stateful server)，什么是有状态服务器呢？简单的理解就是服务器会保留与客户端的连接，不用在每次打开新窗口时都创建连接，同时客户的记录会被保留。比方说你在淘宝买了一件物品放进了购物车，任你怎么切换窗口查看其它物品购物车内都保留了你的物品。而相反，对于无状态服务器(stateless server)，用户的行踪服务器都不知道，甚至连用户是否登陆了也不知道，这就需要利用我们常见的Cookie和Session来记录用户状态，用户的每个请求都需要带上自己的Cookie和Session。

**4."Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,\*/\*;q=0.8"**

 浏览器支持的MIME类型分别是text/html、application/xhtml+xml、application/xml和\*/\*，优先顺序从左到右排序。MIME(Multipurpose Internet Mail Extensions)多功能Internet邮件扩充服务，是一种多用途网际邮件扩充协议。text/html、application/xhtml+xml、application/xml都是MIME类型，斜杠前面是type(类型)，斜杠后面是subject(子类型)。前者范围较大，后者范围更明确，即大类中的小类。text/html表示html文档，application/xhtml+xml表示xhtml文档，application/xml表示xml文档。

**5."User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.66 Safari/537.36 LBBROWSER"**

 这么多信息简直了！恐怕这是最好用的信息了。User-Agent可以携带浏览器名和版本号、操作系统名和版本号以及默认语言。详细的介绍请参读[这里](http://blog.csdn.net/rj042/article/details/6991441)

**6."Host": "localhost:8000"**

 服务器主机(网站的IP)

**7."Cache-Control": "max-age=0"**

 "max-age"表明了响应被缓存的有效秒数。允许你的网站被缓存将大大减少下载的时间和宽带，也能提高浏览器的载入速度。

**8."If-None-Match": "\\"647237d1c3f1f1f586f1e042ec090b9071d0ed46\\"**

 服务器在response中添加ETag信息(就是那一大串数字)，当用户再次请求该资源时，将在request中加入ETag。如果服务器验证请求的ETag没有改变(资源没有更新)，将返回一个304状态告诉用户使用本地缓存文件。否则返回200状态和新的资源和ETag。

参考文档：[http://www.tornadoweb.org/en/stable/httputil.html#tornado.httputil.HTTPHeaders.get\_list](http://www.tornadoweb.org/en/stable/httputil.html#tornado.httputil.HTTPHeaders.get_list) 
 [https://blog.csdn.net/simba_scorpio/article/details/41145457](https://blog.csdn.net/simba_scorpio/article/details/41145457) 
 [https://blog.csdn.net/simba_scorpio/article/details/41145457](https://blog.csdn.net/simba_scorpio/article/details/41145457)
````
