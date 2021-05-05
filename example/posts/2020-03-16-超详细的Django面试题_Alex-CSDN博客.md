---
title: 超详细的Django面试题_Alex-CSDN博客
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

> Hello，我是 Alex 007，为啥是 007 呢？因为叫 Alex 的人太多了，再加上每天 007 的生活，Alex 007 就诞生了。

## 框架层

### 01. 什么是 Django 框架？（初级）

Django 是一个开放源代码的 Web 应用框架，由 Python 写成。采用了 MTV 的框架模式。使用这种架构，程序员可以方便、快捷地创建高品质、易维护、数据库驱动的应用程序。它还包含许多功能强大的第三方插件，使得 Django 具有较强的可扩展性。

* * *

### 02.Django 对 web 开发有哪些优势？（初级）

-   **功能完善、要素齐全**：该有的、可以没有的都有，自带大量常用工具和框架，无须你自定义、组合、增删及修改。
-   **完善的文档**：经过十多年的发展和完善，Django 有广泛的实践案例和完善的在线文档。开发者遇到问题时可以搜索在线文档寻求解决方案。
-   **强大的数据库访问组件**：Django 的 Model 层自带数据库 ORM 组件，使得开发者无须学习其他数据库访问技术（SQL、pymysql、SQLALchemy 等）。
-   **灵活的 URL 映射**：Django 使用正则表达式管理 URL 映射，灵活性高。新版的 2.0，进一步提高了 URL 编写的优雅性。
-   **丰富的 Template 模板语言**：类似 jinjia 模板语言，不但原生功能丰富，还可以自定义模板标签，并且与其 ORM 的用法非常相似。
-   **自带后台管理系统 admin**：只需要通过简单的几行配置和代码就可以实现一个完整的后台数据管理控制平台。
-   **完整的错误信息提示**：在开发调试过程中如果出现运行错误或者异常，Django 可以提供非常完整的错误信息帮助定位问题。

* * *

### 03. 简述 Django 项目的组成模块（初级）

**Project**：工程是承载了 Django 实例的所有设置的 Python 程序包。

大部分情况下，一个 Web 站点就是一个工程。工程内可以新建及存放该工程固有的应用，或者保存 Web 站点的设置 (数据库设置、Django 的选项设置、各应用的设置等)

**Apps**：对于 Django 而言，应用之的是表示单一工程的 Web 应用的 Python 程序包。

由于其本质就是 Python 程序包，因此方法 PYTHONPATH 有效地任何位置都没有问题。这里最好尽量减少应用与工程、应用于应用之间的依赖关系，做到功能独立，以便在其他工程中重复利用。

**Model**：Django 提供了 O/R 映射工具，因此可以用 Python 代码来描述数据库布局。

每个模型都是继承了 django.db.models.Model 类的 Python 的类，分别对应数据库中的一个表格。通过建数据库的字段、关系、行为定义为模型类的属性或方法，我们可以使用丰富且灵活的数据库方位 API。

**URL Route**：URL 分配器机制使得 URL 信息不再受框架及扩展名的制约，从而让 Web 应用的 URL 设计保持简介。

URl 在 URlconf 模块中进行描述，URLconf 模块中包含使用正则表达式书写的 URL 和 Python 函数的映像。URlconf 能够以应用为单位进行分割，因此提高了应用的可重复利用性。另外，我们可以利用给 URL 设置名称并定义的方式让代码和目标直接通过该名称调用 URL，从而将 URL 设计与代码分离。

**View**:Django 的视图时一类函数，它能够生成指定页面的 HttpResponse 对象或像 Http 404 这样的异常情况，返回 HTTP 请求。

典型的视图函数的处理流程通常是从请求参数中获取数据，读取模型，热按后根据获取的数据渲染模板。

**DTL**：在 Django 的概念中，模板系统只负责显示，并不是编写逻辑代码的环境。

因此 Django 的模板系统将设计与内容、代码分离开来，是一共功能强、扩展性高、对设计者很友好的模板语言。

模板基于文本而不是 XML，因此它不但能生成 XML 和 HTML，还能生成 E-mail、JavaScript、CSV 等任意文本格式。

另外，如果使用模板继承功能，子模板只需要将父模板中预留的空位填满即可。我们在编写模板时只需要描述各个模板独有的部分，因此可以省去重复冗余的编码过程。

**Admin**: 大多 Web 应用在运行过程中，都需要一个专供拥有管理员权限的用户添加、编辑、删除数据的界面，但是实际制作这个界面并不容易。

Django 只需将已经完工的模型添加到管理站点，就能根据模型定义，动态地生成页面。为我们提供一个功能齐全的管理界面。

**Cache System**:Django 可以使用 memcached 等缓存后端轻松地缓存数据。

比如可以将动态页面的渲染结果缓存下来，等到下次需要时直接读取缓存，从而不必每次都对动态页面进行处理。

缓存的后端可以从 memcached、数据库、文件系统、本地内存等位置进行选择。缓存对象也支持整个网站、特定的整个视图、部分模板、特定数据等。

* * *

### 04. 简述 MVC 模式和 MVT 模式 (初级)

![](https://img-blog.csdnimg.cn/20200413123725976.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMzNjI4MQ==,size_16,color_FFFFFF,t_70)

MVC 就是把 Web 应用分为模型 (M)，控制器 C 和视图(V) 三层, 他们之间以一种插件式的、松耦合的方式连接在一起，模型负责业务对象与数据库的映射(ORM)，视图负责与用户的交互(页面)，控制器接受用户的输入调用模型和视图完成用户的请求。

![](https://img-blog.csdnimg.cn/20200413123735539.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMzNjI4MQ==,size_16,color_FFFFFF,t_70)

Django 的 MTV 模式本质上和 MVC 是一样的，也是为了各组件间保持松耦合关系，只是定义上有些许不同，Django 的 MTV 分别是：

```
M 代表模型（Model）： 负责业务对象和数据库的关系映射(ORM)。

T 代表模板 (Template)：负责如何把页面展示给用户(html)。

V 代表视图（View）： 负责业务逻辑，并在适当时候调用Model和Template。

```

除了以上三层之外，还需要一个 URL 分发器，它的作用是将一个个 URL 的页面请求分发给不同的 View 处理，View 再调用相应的 Model 和 Template，MTV 的响应模式。

* * *

### 05. 简述 Django 请求生命周期（初级）

![](https://img-blog.csdnimg.cn/20200413123748324.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMzNjI4MQ==,size_16,color_FFFFFF,t_70)

1.  uWSGI 服务器通过 wsgi 协议, 将 HttpRequest 交给 web 框架 （Flask、Django）
2.  首先到达 request 中间件，对请求对象进行校验或添加数据，例如：csrf、request.session，如果验证不通过直接跳转到 response 中间件
3.  过 URL 配置文件找到 urls.py 文件
4.  根据浏览器发送的 URL，通过视图中间件去匹配不同的视图函数或视图类，如果没有找到相对应的视图函数，就直接跳转到 response 中间件
5.  在视图函数或视图类中进行业务逻辑处理，处理完返回到 response 中间件
6.  模型类通过 ORM 获取数据库数据，并返回序列化 json 或渲染好的 Template 到 response 中间件
7.  所有最后离开的响应都会到达 response 中间件，对响应的数据进行处理，返回 HttpResponse 给 wsgi
8.  wsgi 经过 uWSGI 服务器, 将响应的内容发送给浏览器。

* * *

### 07. 什么是 WSGI？（初级）

WSGI(Web Server Gateway Interface，即 Web 服务器网关接口) 是 Python 定义的 Web 服务器和 Web 应用程序或框架之间的一种简单而通用的接口。

它是 Python 为了解决 Web 服务器端与客户端之间的通信问题而产生的，它基于现存的 CGI 标准而设计。

其定义了 Web 服务器如何与 Python 应用程序进行交互，让 Python 写的 Web 应用程序可以和 Web 服务器对接起来。

* * *

### 08.uwsgi、uWSGI 和 WSGI 的区别？（中级）

-   uwsgi：是 uWSGI 服务器实现的独有协议，用于 Nginx 服务与 uWSGI 服务的通信规范
-   uWSGI：是一个 Web 服务器，它实现了 WSGI/uwsgi/HTTP 等协议，用于接收 Nginx 转发的动态请求，处理后发个 python 应用程序
-   WSGI：用在 python web 框架（Django/Flask）编写的应用程序与 web 服务器之间的规范

* * *

### 09.Django 的 HttpRequest 对象是在什么时候创建的？（中级）

```python
class WSGIHandler(base.BaseHandler):
    request = self.request_class(environ)


```

请求走到 WSGIHandler 类的时候，执行 cell 方法，将 environ 封装成了 request。

* * *

### 10. 什么是中间件并简述其作用（初级）

中间件是一个用来处理 Django 请求和响应的框架级钩子。

它是一个轻量、低级别的插件系统，用于在全局范围内改变 Django 的输入和输出。

每个中间件组件都负责做一些特定的功能。

* * *

### 11. 列举 django 中间件的 5 个方法，以及 django 中间件的应用场景（初级）

process_request : 请求进来时, 权限认证

process_view : 路由匹配之后, 能够得到视图函数

process_exception : 异常时执行

process_template_responseprocess : 模板渲染时执行

process_response : 请求有响应时执行

* * *

### 12. 简述 Django 对 http 请求的执行流程（初级）

在接受一个 Http 请求之前的准备, 需启动一个支持 WSGI 网关协议的服务器监听端口等待外界的 Http 请求，比如 Django 自带的开发者服务器或者 uWSGI 服务器。

Django 服务器根据 WSGI 协议指定相应的 Handler 来处理 Http 请求。

此时服务器已处于监听状态，可以接受外界的 Http 请求, 当一个 http 请求到达服务器的时候, Django 服务器根据 WSGI 协议从 Http 请求中提取出必要的参数组成一个字典（environ）并传入 Handler 中进行处理。

在 Handler 中对已经符合 WSGI 协议标准规定的 http 请求进行分析，比如加载 Django 提供的中间件，路由分配，调用路由匹配的视图等。

最后返回一个可以被浏览器解析的符合 Http 协议的 HttpResponse。

* * *

### 13.Django 中 session 的运行机制是什么？（初级）

django 的 session 存储可以利用中间件来实现。

需要在 settings.py 文件中注册 APP、设置中间件用于启动。

设置存储模式（数据库 / 缓存 / 混合存储）和配置数据库缓存用于存储，生成 django_session 表单用于读写。

* * *

### 14. 什么是 CSRF，请描述其攻击原理，在 Django 中如何解决？（初级）

CSRF（cross-site request forgery）简称跨站请求伪造。

```
例如，你访问了信任网站A,然后网站A会用保存你的个人信息并返回给你的浏览器一个cookie。
然后呢，在cookie的过期时间之内，你去访问了恶意网站B，它给你返回一些恶意请求代码，要求你去访问网站A。
而你的浏览器在收到这个恶意请求之后，在你不知情的情况下，会带上保存在本地浏览器的cookie信息去访问网站A，然后网站A误以为是用户本身的操作。
这将导致来自恶意网站C的攻击代码会被执行：发邮件，发消息，修改你的密码，购物，转账，偷窥你的个人信息，导致私人信息泄漏和账户财产安全受到威胁。

```

在 post 请求时，form 表单或 ajax 里添加 csrf_token，服务端开启 CSRF 中间件进行验证。

解决原理是页面添加 csrf_token 值后，用户通过 URL 访问（GET 请求）该页面时，Django 会在响应中自动帮我们生成 cookie 信息，返回给浏览器，同时在前端代码会生成一个 csrf_token 值。

然后当你 POST 提交信息时，Django 会自动比对 cookie 里和前端 form 表单或 ajax 提交上来的 csrf_token 值，两者一致，说明是当前浏览器发起的正常请求并处理业务逻辑返回响应。

那么第三方网站拿到你的 cookie 值为什么不能通过验证呢？

因为他没你前端的那个随机生成的 token 值，他总不能跑到你电脑面前查看你的浏览器前端页面自动随机生成的 token 值吧。

* * *

### 15. Django 中 CSRF 的实现机制（初级）

1.  django 第 1 次响应来自某个客户端的请求时, 服务器随机产生 1 个 token 值，把这个 token 保存在 session 中; 同时服务器把这个 token 放到 cookie 中交给前端页面；
2.  该客户端再次发起请求时，把这个 token 值加入到请求数据或者头信息中, 一起传给服务器；
3.  服务器校验前端请求带过来的 token 和 session 里的 token 是否一致。

* * *

### 16. 什么是跨域请求，其有哪些方式？（初级）

-   跨域是指一个域下的文档或脚本试图去请求另一个域下的资源。

方式如下：

1.  资源跳转： a 链接、重定向、表单提交
2.  资源嵌入： link/script/img/frame/dom 等标签，还有样式中 background:url()、@font-face() 等文件外链
3.  脚本请求： js 发起的 ajax 请求、dom 和 js 对象的跨域操作等

* * *

### 17. 跨域请求 Django 是如何处理的？（初级）

使用第三方工具 django-cors-headers 即可彻底解决

-   注册 app
-   添加中间件
-   配置运行跨域请求方法

* * *

### 16. 什么是信号量？（初级）

Django 包含一个 "信号调度程序"，它有助于在框架中的其他位置发生操作时通知分离的应用程序。

简而言之，信号允许某些发送者通知一组接收器已经发生了某些动作。

当许多代码可能对同一事件感兴趣时，它们特别有用。

* * *

### 17.web 框架的本质是什么？（初级）

web 框架本质是一个 socket 服务端，用户的浏览器是一个 socket 客户端。

* * *

### 18. 谈谈你对 restful 规范的认识（初级）

restful 是一种软件架构设计风格，并不是标准，它只是提供了一组设计原则和约束条件，主要用于客户端和服务器交互类的软件。

就像设计模式一样，并不是一定要遵循这些原则，而是基于这个风格设计的软件可以更简洁，更有层次，我们可以根据开发的实际情况，做相应的改变。

它里面提到了一些规范，例如

1.restful 提倡面向资源编程, 在 url 接口中尽量要使用名词，不要使用动词

2\. 在 url 接口中推荐使用 Https 协议，让网络接口更加安全

3\. 可以根据 Http 不同的 method，进行不同的资源操作

4\. 在 url 中可以体现版本号

5.url 中可以体现是否是 API 接口

6.url 中可以添加条件去筛选匹配

7\. 响应式应该设置状态码

8\. 有返回值，而且格式为统一的 json 格式

9\. 返回错误信息

10\. 返回结果中要提供帮助链接，即 API 最好做到 Hypermedia

* * *

### 19.Django 中如何加载初始化数据？（初级）

Django 在创建对象时在调用 save() 方法后，ORM 框架会把对象的属性写入到数据库中，实现对数据库的初始化。

通过操作对象，查询数据库，将查询集返回给视图函数，通过模板语言展现在前端页面。

* * *

### 20.Django 缓存系统类型有哪些？（初级）

1.  全站缓存，较少使用

```python
MIDDLEWARE_CLASSES = (
    ‘django.middleware.cache.UpdateCacheMiddleware’,  
    'django.middleware.common.CommonMiddleware',
    ‘django.middleware.cache.FetchFromCacheMiddleware’,  
)

```

2.  视图缓存，用户视图函数或视图类中

```python
from django.views.decorators.cache import cache_page
import time

@cache_page(15) 
def index(request):
    t=time.time() 
    return render(request,"index.html",locals())

```

3.  模板缓存，指缓存不经常变换的模板片段

```html
{% load cache %}
    <h3 style="color: green">不缓存:-----{{ t }}</h3>

{% cache 2 'name' %} # 存的key
    <h3>缓存:-----:{{ t }}</h3>
{% endcache %}


```

* * *

### 21. 请简述 Django 下的（内建）缓存机制（初级）

Django 根据设置的缓存方式，浏览器第一次请求时，cache 会缓存单个变量或整个网页等内容到硬盘或者内存中，同时设置 response 头部。

当浏览器再次发起请求时，附带 f-Modified-Since 请求时间到 Django。

Django 发现 f-Modified-Since 会先去参数之后，会与缓存中的过期时间相比较，如果缓存时间比较新，则会重新请求数据，并缓存起来然后返回 response 给客户端。

如果缓存没有过期，则直接从缓存中提取数据，返回给 response 给客户端。

* * *

### 22. 什么是 ASGI，简述 WSGI 和 ASGI 的关系与区别？（初级）

ASGI 是异步网关协议接口，一个介于网络协议服务和 Python 应用之间的标准接口，能够处理多种通用的协议类型，包括 HTTP，HTTP2 和 WebSocket。

WSGI 是基于 HTTP 协议模式的，不支持 WebSocket，而 ASGI 的诞生则是为了解决 Python 常用的 WSGI 不支持当前 Web 开发中的一些新的协议标准。

同时，ASGI 对于 WSGI 原有的模式的支持和 WebSocket 的扩展，即 ASGI 是 WSGI 的扩展。

* * *

### 23.Django 如何实现 websocket？（初级）

django 实现 websocket 使用 channels。

channels 通过 http 协议升级到 websocket 协议，保证实时通讯。

也就是说，我们完全可以用 channels 实现我们的即时通讯，而不是使用长轮询和计时器方式来保证伪实时通讯。

他使用 asgi 协议而不是 wsgi 协议，他通过改造 django 框架，使 django 既支持 http 协议又支持 websocket 协议。

* * *

### 25. 列举 django 的核心组件（初级）

-   用于创建模型的对象关系映射；
-   为最终用户设计较好的管理界面；
-   URL 设计；
-   设计者友好的模板语言；
-   缓存系统。

* * *

### 26.Django 本身提供了 runserver，为什么不能用来部署？（初级）

1.  runserver 方法是调试 Django 时经常用到的运行方式，它使用 Django 自带的 WSGI Server 运行，主要在测试和开发中使用，并且 runserver 开启的方式也是单进程。
2.  uWSGI 是一个 Web 服务器，它实现了 WSGI 协议、uwsgi、http 等协议。

注意 uwsgi 是一种通信协议，而 uWSGI 是实现 uwsgi 协议和 WSGI 协议的 Web 服务器。

uWSGI 具有超快的性能、低内存占用和多 app 管理等优点，并且搭配着 Nginx 就是一个生产环境了，能够将用户访问请求与应用 app 隔离开，实现真正的部署。

相比来讲，支持的并发量更高，方便管理多进程，发挥多核的优势，提升性能。

* * *

### 27.ajax 请求的 csrf 解决方法 (高级)

1.  首先在你需要发起 ajax post 请求的页面的里面随便一个地方加上 {% crsr_token %}
2.  在发起 ajax post 请求时，组织 json 参数时，将浏览器 cookie 中的值赋予加入 json 中，键名为‘csrfmiddlewaretoken’

* * *

## 路由层

### 01. 路由优先匹配原则是什么？（初级）

**在 url 匹配列表中位置优先匹配**

```
如第1条和第2条同时满足匹配规则，则优先匹配第1条。

如第1条为正则模糊匹配，第2条为精确匹配，也是优先匹配第1条

```

* * *

### 02.urlpatterns 中的 name 与 namespace 的区别（初级）

name: 给路由起一个别名

namespace: 防止多个应用之间的路由重复

* * *

### 03.Django 路由系统中 include 是干嘛用的？（初级）

include 用作路由转发，通常，我们会在每个 app 里，各自创建一个 urls.py 路由模块，然后从根路由出发，将 app 所属的 url 请求，全部转发到相应的 urls.py 模块中。

* * *

### 04.Django2.x 中的 path 与 django1.x 里面的 URL 有什么区别?（初级）

path 与 url 是两个不同的模块, 效果都是响应返回页面, path 调用的是 python 第三方模块或框架, 而 url 则是自定义的模块。

url 默认支持正则表达式，而 path 不支持，正则表达式需要使用另外一个函数 re_path。

* * *

### 05.Django 重定向的几种方法，用的什么状态码？（初级）

-   HttpResponse
-   Redirect
-   Reverse

状态码：302,301

* * *

## 模型层

### 01. 命令 migrate 和 makemigrations 的差别？（初级）

-   makemigrations: 生成迁移文件
-   migrate: 执行迁移

* * *

### 02.Django 的 Model 的继承有几种形式？（初级）

1.  抽象继承

父类继承来自 model.Model, 但不会在底层数据库生成相应的数据表, 父类的属性存储在其子类的数据表中。

作用: 多个表若有相同的字段时, 可以将这些字段统一定义在抽象类中.

对于内联的 Meta 类的继承，一般的，父类的 Meta 类的属性会继承给子类，子类也可以在自己的 Meta 中重写或者拓展父类的 Meta，拓展的话主要是继承父类的 Meta。

2.  多表继承

每个模型类都会在底层数据库中生成相应的数据表管理数据。

父类中的字段不会重复地在对个子类相关的数据表中进行定义。

3.  proxy model(代理 model)

代理模型中子类只用于管理父类的数据, 而不实际存储数据。

使用原因: 子类中的新特性不会影响父类行为以及已有代码的行为。

* * *

### 03.class Meta 中的元信息字段有哪些？（初级）

1.  Model 类可以通过元信息类设置索引和排序信息
2.  元信息是在 Model 类中定义一个 Meta 子类

```python
class Meta:
    
    db_table = 'table_name'             
    index_together = ('tag1', 'tag2')   
    unique_together = ('tag3', 'tag4')  
    verbose_name = 'table_name'         
    verbose_name_plural = verbose_name 
    ordering = 'ordering_tag'           
    abstract =True                      
    
    
    
    
    
    app_label='myapp'  
    
    
    db_table='my_owner_table' 
    
    
    
    db_tablespace
    
    
    
    
    get_latest_by = "order_date"
    
    
    
    
    
    managed
    
    
    
    
    
    permissions = (("can_deliver_pizzas", "Can deliver pizzas"),)
    
    
    
    
    order_with_respect_to = 'pizza'

```

* * *

### 04.Django 模型类关系有哪几种？（初级）

-   一对一关系：OneToOneField
-   一对多关系：ForeignKey
-   多对多关系：ManyToManyField

* * *

### 05. 外键有什么用，什么时候合适使用外键 ，外键一定需要索引吗？（中级）

-   程序很难 100％保证数据的完整性, 而用外键即使在数据库服务器宕机或异常的时候, 也能够最大限度的保证数据的一致性和完整性。
-   如果项目性能要求不高, 安全要求高, 建议使用外键，如果项目性能要求高, 安全自己控制，不用外键，因为外键查询比较慢。
-   加入外键的主要问题就是影响性能, 因此加入索引能加快关联查询的速度。

* * *

### 06.`Primary Key`和`Unique Key`的区别？（中级）

-   Primary key 与 Unique Key 都是唯一性约束。
-   Primary key 是主键，一个表只能由一个，Unique key 是唯一键，一个表可以有多个唯一键字段。
-   Primary key 必须不能为空，Unique Key 可为空。

* * *

### 07.DateTimeField 类型中的`auto_now`与`auto_now_add`有什么区别？（初级）

-   DateTimeField.auto_now 用于记录更新时间

这个参数的默认值为 false，设置为 true 时，能够在保存该字段时，将其值设置为当前时间，并且每次修改 model，都会自动更新。

因此这个参数在需要存储 “最后修改时间” 的场景下，十分方便。

需要注意的是，设置该参数为 true 时，并不简单地意味着字段的默认值为当前时间，而是指字段会被 “强制” 更新到当前时间，你无法程序中手动为字段赋值。

如果使用 django 再带的 admin 管理器，那么该字段在 admin 中是只读的。

-   DateTimeField.auto_now_add 用于记录创建时间

这个参数的默认值也为 False，设置为 True 时，会在 model 对象第一次被创建时，将字段的值设置为创建时的时间，以后修改对象时，字段的值不会再更新。

该属性通常被用在存储 “创建时间” 的场景下。

与 auto_now 类似，auto_now_add 也具有强制性，一旦被设置为 True，就无法在程序中手动为字段赋值，在 admin 中字段也会成为只读的。

* * *

### 08. 当删除一个外键的时候，其关联的表有几种处理方式？（初级）

有 6 种处理方式：

1.  同时删除父表和子表

CASCADE：代表删除联级，父表（少类表）被删除的记录在子表（多类表）中所有字段也会被对应删除，模拟 SQL 语言中的 ON DELETE CASCADE 约束，将定义有外键的模型对象同时删除！（该操作为当前 Django 版本的默认操作！）

2.  阻止删除父表

PROTECT：阻止上面的删除操作，但是弹出 ProtectedError 异常

3.  子表设置为空

SET_NULL：代表父表（少类表）被删除后子表（多类表）对应的外键字段会设置为 null，只有当字段设置了 null=True，blank=True 时，方可使用该值。

4.  子表设置为默认值

SET_DEFAULT: 代表父表（少类表）被删除后子表（多类表）对应的外键字段会设置为默认值。只有当字段设置了 default 参数时，方可使用。

5.  子表什么都不做

DO_NOTHING：什么也不做，一切看数据库级别的约束

6.  设置为一个传递给 SET() 的值或者一个回调函数的返回值

SET()：设置为一个传递给 SET() 的值或者一个回调函数的返回值。注意大小写，用得很少。

* * *

### 09. 如何通过外键，子表查询父表和父表查询子表（中级）

父表和子表关系如下：

```python
from django.db import models
 
class Person(models.Model):
    name = models.CharField(max_length=64)
    age = models.IntegerField()
    tel = models.CharField(max_length=64)
 
    @property
    def all_cars(self):
        '''返回全部信息'''
        return self.cars.all()
 
    @property
    def info(self):
        '''返回部分信息'''
        return '%s %s' % (self.name, self.tel)
 
class Car(models.Model):
    owner = models.Foreignkey(Person, related_name='cars')
    name = models.CharField(max_length=64)
    price = models.FloatField()

```

子表查询父表

```python
car = Car.objects.get(id=1)

owner = car.owner

```

父表查询子表

```python
Tom = Person.objects.get(id=1)




Tom.Car_set().all()


Tom.cars.all()


Tom.all_cars

```

* * *

### 10. 谈谈 GenericForeignkey 和 GenericRelation（高级）

GenericForeignkey 和 GenericRelation 的方法能够解决多外键的表单产生的大量沉余数据。

通过 ContentType 的查询，起到一个自动一对多的作用，能和任何模型都能连接起来，保证了代码的干净。

避免了创建大量无用的空数据，有效减少存储空间和服务器压力。

* * *

### 11.django 中怎么写原生 SQL？（中级）

1.  使用 extra

```python

Book.objects.filter(publisher__name='人民邮电出版社').extra(where=['price>50']) 

```

2.  使用 raw

```python
books=Book.objects.raw('select * from hello_book')  

for book in books:  
   print(book)

```

3.  使用游标

```python
from django.db import connection  
cursor = connection.cursor() 
cursor.execute("insert into hello_author(name) values ('特朗普')"）
cursor.execute("update hello_author set name='普京' WHERE name='特朗普'")  
cursor.execute("delete from hello_author where name='普京'")  
cursor.execute("select * from hello_author")  
cursor.fetchone()  
cursor.fetchall() 

```

* * *

### 12. 谈一谈你对 ORM 的理解（中级）

ORM 是 “对象 - 关系 - 映射” 的简称。

ORM 是 MVC 或者 MVC 框架中包括一个重要的部分，它实现了数据模型与数据库的解耦，即数据模型的设计不需要依赖于特定的数据库，通过简单的配置就可以轻松更换数据库，这极大的减轻了开发人员的工作量，不需要面对因数据库变更而导致的无效劳动。

* * *

### 13. 如何使用 Django ORM 批量创建数据？（初级）

可以使用 django.db.models.query.QuerySet.bulk_create() 批量创建对象，减少 SQL 查询次数。

```python

querysetlist=[]


for i in resultlist:
    querysetlist.append(Account(name=i))   
    

Account.objects.bulk_create(querysetlist)

```

* * *

### 14. 列举 django ORM 中操作 QuerySet 对象的方法 (至少 5 个)（初级）

| 方法            | 作用                                                        |
| ------------- | --------------------------------------------------------- |
| all()         | 查询所有结果                                                    |
| filter()      | 过滤查询对象。获取不到返回 None。                                       |
| get()         | 返回与所给筛选条件相匹配的对象，返回结果有且只有 1 个。如果符合筛选条件的对象超过 1 个或者没有都会抛出错误。 |
| exclude()     | 排除满足条件的对象                                                 |
| order_by()    | 对查询结果排序                                                   |
| reverse()     | 对查询结果反向排序                                                 |
| count()       | 返回数据库中匹配查询 (QuerySet) 的对象数量。                              |
| first()       | 返回第一条记录                                                   |
| last()        | 返回最后一条记录                                                  |
| exists()      | 如果 QuerySet 包含数据，就返回 True，否则返回 False                      |
| values()      | 返回包含对象具体值的字典的 QuerySet                                    |
| values_list() | 与 values() 类似，只是返回的是元组而不是字典。                              |
| distinct()    | 对查询集去重                                                    |

* * *

### 15.ORM 如何取消级联？（初级）

```python
user = models.ForeignKey(User,blank=True,null=True,on_delete=models.SET_NULL)

```

在父表被删除，null 为 True 的时候就会取消级联。

* * *

### 16. 查询集的 2 大特性？什么是惰性执行？（中级）

特性：

1.  惰性执行
2.  缓存

惰性执行是指创建查询集不会访问数据库，直到调用数据时，才会访问数据库。

* * *

### 17. 查询集返回的列表过滤器有哪些？（中级）

all()：返回所有数据

filter()：返回满足条件的数据

exclude()：返回满足条件之外的数据，相当于 sql 语句中 where 部分的 not 关键字

order_by()：排序

* * *

### 18.selected_related 与 prefetch_related 有什么区别？（高级）

在 Django 中当创建一个查询集的时候，并没有跟数据库发生任何交互。

因此我们可以对查询集进行级联的 filter 等操作，只有在访问 Queryset 的内容的时候，Django 才会真正进行数据库的访问。

而多频率、复杂的数据库查询往往是性能问题最大的根源。

不过我们实际开发中，往往需要访问到外键对象的其他属性。

如果按照默认的查询方式去遍历取值，那么会造成多次的数据库查询，效率可想而知。

在查询对象集合的时候，把指定的外键对象也一并完整查询加载，避免后续的重复查询。

使用 select_related() 和 prefetch_related() 可以很好的减少数据库请求的次数，从而提高性能。

-   select_related 适用于一对一字段（OneToOneField）和外键字段（ForeignKey）查询；
-   prefetch_related 适用多对多字段（ManyToManyField）和一对多字段的查询。

* * *

### 19.values() 与 values_list() 有什么区别？（初级）

values : 读取字典的 Queryset

values_list : 读取元组的 Queryset

* * *

### 20.QueryDict 和 dict 区别？（高级）

在 HttpRequest 对象中, GET 和 POST 属性是 django.http.QueryDict 类的实例。

QueryDict 类似字典的自定义类，用来处理单键对应多值的情况。

在 HttpRequest 对象中, 属性 GET 和 POST 得到的都是 django.http.QueryDict 所创建的实例。

这是一个 django 自定义的类似字典的类，用来处理同一个键带多个值的情况。

在 python 原始的字典中，当一个键出现多个值的时候会发生冲突，只保留最后一个值。

而在 HTML 表单中，通常会发生一个键有多个值的情况，例如，多选框就是一个很常见情况。

request.POST 和 request.GET 的 QueryDict 在一个正常的请求 / 响应循环中是不可变的。

若要获得可变的版本，需要使用. copy() 方法。

-   python dict 当一个键出现多个值的时候会发生冲突，只保留最后一个值。
-   QueryDict 是类似字典的自定义类，用来处理单键对应多值的情况。

* * *

### 21.Django 中查询 Q 和 F 的区别？（中级）

Q 查询：对数据的多个字段联合查询（常和且或非 "& | ~" 进行联合使用）

F 查询：对数据的不同字段进行比较（常用于比较和更新，对数据进行加减操作）

* * *

## 视图层

### 01. 简述什么是 FBV 和 CBV（初级）

FBV（function base views）使用视图函数处理请求

CBV（class base views）使用视图类处理请求

* * *

### 02. 如何给 CBV 的程序添加装饰器？（初级）

导入 method_decorator 装饰器

1.  给方法加
2.  给 dispatch 加
3.  给类加

```python
from django.utils.decorators import method_decorator


@method_decorator(check_login)
def post(self, request):
    '''给方法加'''
    ...
    
@method_decorator(check_login)
def dispatch(self, request, *args, **kwargs):
    '''给dispatch加'''
    ...
    
@method_decorator(check_login, name="get")
@method_decorator(check_login, name="post")
class HomeView(View):
    '''给类加'''
    ...


```

* * *

### 03. 常用视图响应的方式有哪些？（初级）

常用视图响应的方式有 4 种方式 redirect、Response、HttpResponse 和 JsonResponse

```python
return Response(content=响应体, content_type=响应体数据类型, status=状态码)
return HttpResponse(content=响应体, content_type=响应体数据类型, status=状态码) 
return JsonResponse({‘city’: ‘beijing’, ‘subject’: ‘python’},status=response.status_code)
return redirect(‘/index.html’)

```

* * *

### 04. 在视图函数中，常用的验证装饰器有哪些？（中级）

| 装饰器                   | 用途                           |
| --------------------- | ---------------------------- |
| @login_required()     | 检查用户是否通过身份验证                 |
| @group_required()     | 检查用户是否属于有权限的用户组访问            |
| @anonymous_required() | 检验用户是否已经登录                   |
| @superuser_only()     | 它只允许超级用户才能访问视图               |
| @ajax_required        | 用于检查请求是否是 AJAX 请求            |
| @timeit               | 用于改进某个视图的响应时间，或者只想知道运行需要多长时间 |

* * *

### 05. 视图函数和视图类的区别？（高级）

|      | 优点                                              | 缺点                                            |
| ---- | ----------------------------------------------- | --------------------------------------------- |
| 视图函数 | 容易实现跟理解；流程简单；直接使用装饰器                            | 代码难以重用；处理 HTTP 请求时要有分支表达式                     |
| 视图类  | 易拓展跟代码重用；可以用混合类继承；单独用类方法处理 HTTP 请求；有许多内置的通用视图函数 | 不容易去理解；代码流程负载；父类混合类中隐藏较多代码；使用装饰器时需要额外的导入或覆盖方法 |

* * *

## 高阶

### 01.Django 如何实现高并发？（高级）

-   Nginx + uWSGI + Django
-   Nginx + gunicorn + gevent + Django

* * *

### 02. 如何提高 Django 应用程序的性能？（高级）

-   **前端优化**

1\. 减少 http 请求，减少数据库的访问量，比如使用雪碧图。

2\. 使用浏览器缓存，将一些常用的 css，js，logo 图标，这些静态资源缓存到本地浏览器，通过设置 http 头中的 cache-control 和 expires 的属性，可设定浏览器缓存，缓存时间可以自定义。

3\. 对 html，css，javascript 文件进行压缩，减少网络的通信量。

-   **后端优化**

1\. 合理的使用缓存技术，对一些常用到的动态数据，比如首页做一个缓存，或者某些常用的数据做个缓存，设置一定得过期时间，这样减少了对数据库的压力，提升网站性能。

2\. 使用 celery 消息队列，将耗时的操作扔到队列里，让 worker 去监听队列里的任务，实现异步操作，比如发邮件，发短信。

3\. 就是代码上的一些优化，补充：nginx 部署项目也是项目优化，可以配置合适的配置参数，提升效率，增加并发量。

4\. 如果太多考虑安全因素，服务器磁盘用固态硬盘读写，远远大于机械硬盘，这个技术现在没有普及，主要是固态硬盘技术上还不是完全成熟， 相信以后会大量普及。

5\. 服务器横向扩展。

* * *

### 03.Django 中当用户登录到 A 服务器进入登陆状态，下次被 nginx 代理到 B 服务器会出现什么影响？（高级）

如果用户在 A 应用服务器登陆的 session 数据没有共享到 B 应用服务器，那么之前的登录状态就没有了。

* * *

### 04. 谈谈对 Celery 的理解（高级）

Celery 是由 Python 开发、简单、灵活、可靠的分布式任务队列，其本质是生产者消费者模型，生产者发送任务到消息队列，消费者负责处理任务。

Celery 侧重于实时操作，但对调度支持也很好，其每天可以处理数以百万计的任务。

特点：

```
简单：熟悉celery的工作流程后，配置使用简单

高可用：当任务执行失败或执行过程中发生连接中断，celery会自动尝试重新执行任务

快速：一个单进程的celery每分钟可处理上百万个任务

灵活：几乎celery的各个组件都可以被扩展及自定制

```

* * *

### 05.Celery 有哪些应用场景？（高级）

1.  异步任务：当用户在网站进行某个操作需要很长时间完成时，我们可以将这种操作交给 Celery 执行，直接返回给用户，等到 Celery 执行完成以后通知用户，大大提好网站的并发以及用户的体验感。例如：发送验证邮件
2.  定时任务：向定时清除沉余数据或批量在几百台机器执行某些命令或者任务，此时 Celery 可以轻松搞定。

* * *

### 06.Celery 的工作原理是什么？（高级）

Celery 由以下三部分构成：消息中间件 (Broker)、任务执行单元 Worker、结果存储 (Backend)，如下图：

![](https://img-blog.csdnimg.cn/20200413123543974.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMzNjI4MQ==,size_16,color_FFFFFF,t_70)

工作原理：

```
任务模块Task包含异步任务和定时任务。

其中，异步任务通常在业务逻辑中被触发并发往消息队列，而定时任务由Celery Beat进程周期性地将任务发往消息队列；

任务执行单元Worker实时监视消息队列获取队列中的任务执行；

Woker执行完任务后将结果保存在Backend中;

```

消息中间件 Broker

```
消息中间件Broker官方提供了很多备选方案，支持RabbitMQ、Redis、Amazon SQS、MongoDB、Memcached 等，官方推荐RabbitMQ。

```

任务执行单元 Worker

```
Worker是任务执行单元，负责从消息队列中取出任务执行，它可以启动一个或者多个，也可以启动在不同的机器节点，这就是其实现分布式的核心。

```

结果存储 Backend

```
Backend结果存储官方也提供了诸多的存储方式支持：RabbitMQ、 Redis、Memcached,SQLAlchemy, Django ORM、Apache Cassandra、Elasticsearch。

```

* * *

![](https://img-blog.csdnimg.cn/20200413124003980.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MzMzNjI4MQ==,size_16,color_FFFFFF,t_70) 
 [https://blog.csdn.net/weixin_43336281/article/details/105486125?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242](https://blog.csdn.net/weixin_43336281/article/details/105486125?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242) 
 [https://blog.csdn.net/weixin_43336281/article/details/105486125?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242](https://blog.csdn.net/weixin_43336281/article/details/105486125?utm_medium=distribute.pc_relevant.none-task-blog-baidujs_title-10&spm=1001.2101.3001.4242)
