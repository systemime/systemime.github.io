---
title: 【tornado】参数获取中_ARG_DEFAULT是什么
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

<a name="nHCbd"></a>
## 函数参数
```python
get_argument(name, default=_ARG_DEFAULT, strip=True)
```
<a name="yLSQw"></a>
## 解释

- 从请求体和查询字符串中返回指定参数name的值，如果出现多个同名参数，则返回最后一个的值。
- default为设值未传name参数时返回的默认值，如若default也未设置，则会抛出tornado.web.MissingArgumentError异常。
- strip表示是否过滤掉左右两边的空白字符，默认为过滤。（当传送密码时可以将strip设置为False）



> 翻看源码发现: _ARG_DEFAULT=object() , 至于为什么这样设置呢?
> 

> 主要是为了后面在方法内部进行逻辑校验等处理的时候,能更好的区分该内容是由前端参数传递过来的呢?还是该方法取到的默认值. 所以必须要 _ARG_DEFAULT 和 传过来的arg 有一定的区分度.
> 

> 但是, 我们知道我们没法控制前端通过该参数传递什么值到后端, 但是又要做到区分两者是来自哪里. 所以解决方案一般是: is 身份判断符来判断. 所以, 这里就不能采用 不可变类型来做区分.

