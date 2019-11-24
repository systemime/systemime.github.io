---
layout: post
title: 'django2.2使用mako配置'
subtitle: 'django2.2使用mako做为网页模板语言的使用方式'
date: 2019-11-23 18:40:59
author: qifeng
color: rgb(154,133,255)
cover: 'https://systemime.github.io/img/123.jpg'
tags: mako django
---
### 一、安装mako  

```text
pip install mako
```  

### 二、创建mako配置文件  

> 该步骤最重要的是重写了render函数  

#### 在app内新建 `base_render.py` 文件  

> 文件名可变，保证引用正确即可  

写入如下内容：  
```python
#coding:utf-8

from mako.lookup import TemplateLookup
from django.template import RequestContext
from django.conf import settings
from django.template.context import Context
from django.http import HttpResponse


def render_to_response(request, template, data=None):
    context_instance = RequestContext(request)
    # 引入模板位置
    path = settings.TEMPLATES[0]['DIRS'][0]
    lookup = TemplateLookup(
        directories=[path],
        output_encoding='utf-8',
        input_encoding='utf-8'
    )
    # 导入模板路径
    mako_template = lookup.get_template(template)
    # 防空
    if not data:
        data = {}
    # 判断实例是否存
    if context_instance:
        context_instance.update(data)
    else:
        context_instance = Context(data)

    result = {}

    for d in context_instance:
        result.update(d)
    # 加入csrf_token关键字 csrfmiddlewaretoke 中间件
    result['csrf_token'] = '<input type="hidden" name="csrfmiddlewaretoken" value="{0}" />'.format(request.META.get('CSRF_COOKIE', ''))

    return HttpResponse(mako_template.render(**result))
```  

### 在视图中 `views.py` 导入mako配置  
内容如下：  
```python
from django.shortcuts import render
from django.views.generic import View
# Create your views here.

from .bash_render import render_to_response
# 此句导入mako配置，引入重写的render方法

class Test(View):  # 测试类
    TEMPLATE = 'test.html'

    def get(self, request):

        data = {'name': 'dewei', 'age': 30}

        print(dir(data))

        return render_to_response(request, self.TEMPLATE, data=data)
        # 此处data = data中，第一个data为传入数据名，与base_render中定义的参数名需要相同
```

### 三、使用测试  

#### 新建模板页 `base.html`  

    ```html
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${self.title()}</title>
        <link rel="stylesheet" href="">
        ${self.css()}
    </head>
    <body>
        <!--子页面的导入-->
        ${self.content()}
        <!--子页面js导入-->
        ${self.js()}
    </body>
    </html>
    <!--主体函数-->
    <%def name="content()">
        ${self.main()}
    </%def>
    <!--主函数-->
    <%def name="main()"></%def>
    <!--标签名-->
    <%def name="title()"></%def>
    <!--导入css和js-->
    <%def name="js()"></%def>
    <%def name="css()"></%def>
    ```  

#### 新建子页面 `test.html`  

    ```html  
    <!--引入主页面-->
    <%inherit file="base.html" />
    
    <!--标签页名-->
    <%def name="title()">
        test
    </%def>
    
    <!--js导入-->
    <%def name="js()">
        <script src="https://cdn.bootcss.com/jquery/2.2.0/jquery.js"></script>
    </%def>
    
    <!--主内容-->
    <%def name="main()">
        <h1>hello mako</h1>
    </%def>
    
    <!--css导入-->
    <%def name="css()">
        <link rel="stylesheet" href="/static/test.css" />
    </%def>
    
    <!--
    <!--mako变量显示方法-->
    ${name}
    ${age}
    
    <br />
    <!--mako 在页面中导入模块-->
    <%!
        from django.conf import settings
    %>
    <!--mako 输出-->
    ${settings.TEMPLATES[0]['DIRS'][0]}
    
    <br />
    <!--csrf验证-->
    ${csrf_token}
    
    <br />
    
    <!--mako 在页面中循环用法-->
    %for i in range(20):
        <input type="text" value="${i}" />
    %endfor
    
    <!--mako 在页面中定义函数并使用-->
    <%!
    def name():
        return 'my name is qifeng'
    %>
    
    <input style="display: block" type="text" name="username" value="${name()}" />
    
    -->
    ```  

#### 不同页面之间传参  
- 在子页面 `test.html` 中  
    ```html
    <%def name="main()">
        <%include file="extend.html" args="local_content='你好 mako'" />
        <!--参数传递, file为引入文件名，args为引入界面的变量名及参数内容-->
    </%def>
    ```  
- 在 `extend.html` 中  
    ```html
    <%page args="local_content" />
    <!--通过page方法定义args使得其他页面能定位该页面位置，能够将local_content内容传入-->
    <textarea>
    ${local_content}
    <!-- local_content仅仅是个变量名 -->
    </textarea>
    ```  
