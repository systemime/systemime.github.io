---
title: django-rest-framework解析请求参数 - 简书
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

[![](https://upload.jianshu.io/users/upload_avatars/2078775/d4f963b7e1f4.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96/format/webp)
](https://www.jianshu.com/u/400826f0557c)

0.8892017.10.20 14:51:34 字数 612 阅读 14,980

## 前言

前面的文章中编写了接口, 调通了接口文档. 接口文档可以直接填写参数进行请求, 接下来的问题是如何接受参数, 由于请求方式与参数序列化形式的不同, 接收参数的方式也有不同.

## 前提条件

服务端我们使用**django-rest-framework**编写接口.

    class ReturnJson(APIView):

        coreapi_fields=(
            DocParam("token"),
        )

        def get(self, request, *args, **kwargs):
            return JsonResponse("Hello world!!!!!!!!++++++中文测试") 

这是一个简单接口, ReturnJson 继承自 APIView  
而 APIView 来自 from rest_framework.views import APIView

以下 def get, def post 等等的前提条件都是接口类继承自 APIView.  
当然还可以继承自其它的类例如.

`from rest_framework import viewsets, generics`

    class ReturnJson(generics.ListCreateAPIView)
    class ReturnJson(viewsets.ModelViewSet) 

他们的用法各有特点, 详情查看  
[http://www.django-rest-framework.org/api-guide/viewsets/](https://link.jianshu.com/?t=http://www.django-rest-framework.org/api-guide/viewsets/)  
[http://www.django-rest-framework.org/api-guide/generic-views/](https://link.jianshu.com/?t=http://www.django-rest-framework.org/api-guide/generic-views/)  
[http://www.django-rest-framework.org/api-guide/views/](https://link.jianshu.com/?t=http://www.django-rest-framework.org/api-guide/views/)

### django-rest-framework 如何编写一个接口.

    class ReturnJson(APIView):

        coreapi_fields=(
            DocParam("token"),
        )

        def get(self, request, *args, **kwargs):
            return JsonResponse("Hello world!!!!!!!!++++++中文测试")

        def post(self, request, *args, **kwargs):
            return JsonResponse(data={})
        
        def put(self, request, *args, **kwargs):
            return JsonResponse(data={}) 

对一个 APIView 的子类, 重写 get, post, put 等方法就相当于解析这个路径的 get, post, put 请求,  
请求对象就是 request 对象, http header body 的内容都被包含在 request 对象中.  
request 对象的类来自`from rest_framework.request import Request`  
判断对象是否是某个类实例化而来

    from rest_framework.request import Request
    if isinstance(request, Request) 

### 下面分别分析不同情况的参数位置和类型, 最终写出一个方法能够将任何类型的请求参数统一转换为 dict 方便之后的逻辑编写.

### GET

get 请求中参数都会以[http://xxx.com/api/getjson?param1=asdf¶m2=123](https://link.jianshu.com/?t=http://xxx.com/api/getjson?param1=asdf&param2=123)  
这样的形式拼接在 url 后面.  
在 request 对象中  
request.query_params 中可以获取? param1=32¶m2=23 形式的参数.  
request.query_params 返回的数据类型为 QueryDict  
QueryDict 转为普通 python 字典. query_params.dict() 即可.

### POST

post 请求参数都在请求体中, 但是其实你的 url 可以写成 get 的形式, 最终结果, 参数会有两部分组成, 一部分在 url 中, 一部分在 http body 中, 但是非常不建议这样做.  
接下来的代码编写也不会考虑这样的情况, post 仅考虑所有参数都在 http body 中的情况.

| 提交类型                                                                     | 参数位置                  | 参数类型          |
| ------------------------------------------------------------------------ | --------------------- | ------------- |
| form-data 提交,                                                            | 参数在 data 中,           | 类型为 QueryDict |
| application/json 提交                                                      | 参数在 data 中            | 类型为 dict      |
| (swagger) 使用接口文档提交, 由于使用 curl 提交, 虽然是 post 但是参数依然被类似 get 的形式拼接到了 url 之后, | 此时 参数在 query_params 中 | 类型为 QueryDict |
| x-www-form-urlencoded                                                    | 参数在 data 中            | 类型为 QueryDict |

### PUT

| 提交类型                  | 参数位置         | 参数类型      |
| --------------------- | ------------ | --------- |
| form-data             | request.data | QueryDict |
| application/json      | request.data | dict      |
| x-www-form-urlencoded | request.data | QueryDict |
| (swagger)             | request.data | dict      |

### PATCH

| 提交类型                  | 参数位置         | 参数类型      |
| --------------------- | ------------ | --------- |
| form-data             | request.data | QueryDict |
| application/json      | request.data | dict      |
| x-www-form-urlencoded | request.data | QueryDict |
| (swagger)             | request.data | dict      |

### DELETE

| 提交类型                  | 参数位置                 | 参数类型      |
| --------------------- | -------------------- | --------- |
| form-data             | request.data         | QueryDict |
| application/json      | request.data         | dict      |
| x-www-form-urlencoded | request.data         | QueryDict |
| (swagger)             | request.query_params | QueryDict |
| iOS 端提交和 get 情况一样     | request.query_params | QueryDict |

## 编写参数统一处理的方法

总结一下, 当 url 有? param=1¶m=2 这样的参数时忽略 body 中的参数, 例如 get,delete 提交, 如果 query_params 有内容, 则忽略 body 内容. 将 QueryDict 转为 dict 返回, 再判断 request.data 中是否有内容, 类型如何.

    from django.http import QueryDict
    from rest_framework.request import Request
    def get_parameter_dic(request, *args, **kwargs):
        if isinstance(request, Request) == False:
            return {}

        query_params = request.query_params
        if isinstance(query_params, QueryDict):
            query_params = query_params.dict()
        result_data = request.data
        if isinstance(result_data, QueryDict):
            result_data = result_data.dict()

        if query_params != {}:
            return query_params
        else:
            return result_data 

使用方法

    class ReturnJson(APIView):

        coreapi_fields=(
            DocParam("token"),
        )

        def get(self, request, *args, **kwargs):
            params=get_parameter_dic(request)
            return JsonResponse(data=params)

        def post(self, request, *args, **kwargs):
            params=get_parameter_dic(request)
            return JsonResponse(data=params)

        def put(self, request, *args, **kwargs):
            params=get_parameter_dic(request)
            return JsonResponse(data=params) 

最后的效果

![](https://upload-images.jianshu.io/upload_images/2078775-758f80916949f539.png)

最终效果. png

"小礼物走一走，来简书关注我"

还没有人赞赏，支持一下

[![](https://upload.jianshu.io/users/upload_avatars/2078775/d4f963b7e1f4.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/100/h/100/format/webp)
](https://www.jianshu.com/u/400826f0557c)

[行如风](https://www.jianshu.com/u/400826f0557c "行如风")遇事不烦, 遇阻不燥, 永不言败, 何谓资质? 此性格就是资质.

总资产 3 (约 0.24 元) 共写了 2.3W 字获得 130 个赞共 92 个粉丝

### 被以下专题收入，发现更多相似内容

### 推荐阅读[更多精彩内容](https://www.jianshu.com/)

-   Spring Cloud 为开发人员提供了快速构建分布式系统中一些常见模式的工具（例如配置管理，服务发现，断路器，智...

    [![](https://upload-images.jianshu.io/upload_images/7328262-54f7992145380c10.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/46fd0faecac1)
-   一说到 REST，我想大家的第一反应就是 “啊，就是那种前后台通信方式。” 但是在要求详细讲述它所提出的各个约束，以及如...

    [![](https://cdn2.jianshu.io/assets/default_avatar/12-aeeea4bedf10f2a12c0d50d626951489.jpg)
    时待吾](https://www.jianshu.com/u/ce11c574e718)阅读 2,310 评论 0 赞 17
-   epub 格式下载 感谢 @Cluas 链接: [https://pan.baidu.com/s/1kVGavLd](https://pan.baidu.com/s/1kVGavLd) 密码...

    [![](https://upload.jianshu.io/users/upload_avatars/3966530/fab165ab4a0b.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    夜夜月](https://www.jianshu.com/u/390b6edb26a8)阅读 5,874 评论 30 赞 36

    [![](https://upload-images.jianshu.io/upload_images/3966530-607bf0921c41c689.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/5792137048ba)
-   概述 dubbo 支持多种远程调用方式，例如 dubbo RPC（二进制序列化 + tcp 协议）、http invok...

    [![](https://upload-images.jianshu.io/upload_images/7240015-9bf6c5db0acc26b9?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/5a3e7be3d076)
-   前言 本文标题为实战，那么希望你已经搭建好了环境。如果没有，请参考官方文档进行环境搭建： 官方教程 通过学习这个例... 
    [https://www.jianshu.com/p/f2f73c426623](https://www.jianshu.com/p/f2f73c426623)
