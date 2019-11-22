---
layout: post
title: 'django2.2中Template模板使用'
subtitle: 'django2.2使用django自带模板的用法记录'
date: 2019-11-19 14:40:59
author: qifeng
color: rgb(255,210,32)
cover: '../assets/test.png'
tags: template django
---
## 多个参数传入方法 

{% assign openTag = '{%' %}
{% assign openTa = '{{' %}

```python
# 在view中
from django.shortcuts import render
from django.views import View

class Xxx(View):
    TEMPLATE = 'xxx.html'
    def xxx(self, request):
        data = []
        data['first'] = ''
        data['name'] = ''
        data['age'] = ''
        return render(request, self.TEMPLATE, data)
```

```html
<!-- html中,body内部任意标签位置-->
{{ openTa }} first }}
{{ openTa }} name }}
{{ openTa }} age }}
```

# 引入模板页  
    ```
    {{ openTag }} extend ‘xxx.html’ %}
    # 不需要{{ openTag }}  %}结束
    # html文件存放在template内部
    # 像系统环境中加入template目录写法
    DIRS = os.join.path(BASE_DIR, 'templates')
    ```  

> **导入css**  

```html
{{ openTag }} load static %}
{{ openTag }} block css_style %}
<link rel='' href='{{ openTag }} static 'xxx.css' %}'>
{{ openTag }} endblock %}
```  

> **html内写模板变量**  

```html
# 在html中
<x> hello {{ openTa }} xxx }}}</x>
```  

```python
# 在view中
from django.views import View
from django.shortcuts import render
class Xxx(View):
    def get(request):
        xxx = ''
        return render(request, 'xxx.html', {'xxx_key': xxx})
```  

> **母版中定义自html文件内容位置**  

```html
{{ openTag }} block content %}

{{ openTag }} endblock %}
```  

> **子html中写文件内容**  

```html
{{ openTag }} block content %}

{{ openTag }} endblock %}
```  

> **子html内部定义文件title**  

```html
{{ openTag }} block title %}

{{ openTag }} endblock %}
```  

## 过滤器  

```python
# python内部
from django.shortcuts import render
from django.views import View
import datetime

class Index(View):
    TEMPLATE = 'index2.html'
    def get(self, request, name):
        data = {}
        data['name'] = name
        data['array'] = range(10)
        data['count'] = 20
        data['time'] = datetime.datetime.now()
        data['cut_str'] = 'hello-boy!'
        data['first_big'] = '你好 django! haha'
        data['result'] = False
        data['dic_list'] = [{'name': 'dewei', 'age': 30}, {'name': 'xiaoming', 'age': 18}]
        data['float_num'] = 3.1415926
        data['html_str'] = '<div style="background-color:red;width:50px;height:50px"></div>'
        data['a_str'] = '请看 www.baidu.com'
        data['feature'] = data['time'] + datetime.timedelta(days=5)
        # 注意，传入未来时间
        return render(request, self.TEMPLATE, data)
```  

```html
<label>add:</label>{{ openTa }}count|add:10}}<br />
<label>date:</label>{{ openTa }}time|date:"Y-m-d H:i:s"}}<br />
<label>cut:</label>{{ openTa }}cut_str|cut:"-"}}<br />
<label>capfirst:</label>{{ openTa }}first_big|capfirst}}<br />
<label>default:</label>{{ openTa }}result|default:"空"}}<br />
<label>deafult_if_none:</label>{{ openTa }}result|default_if_none:"none才是空"}}<br />
<label>dictsort:</label>{{ openTa }}dic_list|dictsort:'age'}}<br />
<label>dictsortreversed:</label>{{ openTa }}dic_list|dictsortreversed:'age'}}<br />
<label>first:</label>{{ openTa }}dic_list|first}}<br />

<label>last:</label>{{ openTa }}dic_list|last}} </br />
<label>floatformat:</label>{{ openTa }}float_num|floatformat:4}}<br />
<label>join:</label>{{ openTa }}array|join:"-"}}<br />
<label>length:</label>{{ openTa }}dic_list|length}}<br />
<label>divisibleby:</label>{{ openTa }}count|divisibleby:3}}<br />
<label>length_is:</label>{{ openTa }}dic_list|length_is:2}}<br />
<label>safe:</label>{{ openTa }}html_str|safe}} </br />
<label>random:</label>{{ openTa }}dic_list|random}}<br />
<label>slice:</label>{{ openTa }}html_str|slice:":10"}}<br />
<label>slugify:</label>{{ openTa }}html_str|slugify}}<br />
<label>upper:</label>{{ openTa }}html_str|upper}}<br />
<label>urlize:</label>{{ openTa }}a_str|urlize}}<br />
<label>wordcount:</label>{{ openTa }}first_big|wordcount}}<br />
<label>timeuntil:</label>{{ openTa }}feature|timeuntil}}<br />
<!--<label>custom:</label>{{ openTa }}count|test:10}}-->
```

> **过滤器解释**

|内置过滤器函数|使用方法举例|说明|
|------------|-------|---|
|------------------|-------------------------------------------------|---------------------------------|
|add|`{{ openTa }}value&#124;add:10}}`|value值增加10|
|date|`{{ openTa }}value&#124;date:"Y-m-d H:i:s"}}`|让日期格式化显示|
|cut|`{{ openTa }}cut_str&#124;cut:"xxx"}}`|将value中xxx删除|
|capfirst|`{{ openTa }}first_big&#124;capfirst}}`|将value首字母大写|
|default|`{{ openTa }}result&#124;default:"值为false"}}`|值为false时使用默认值|
|default_if_none|`{{ openTa }}result&#124;default_if_none:"值为空"}}`|值为空时使用默认值|
|dictsort|`{{ openTa }}dic_list&#124;dictsort:'age'}}`|字典类型、按key排序|
|dictsortreversed|`{{ openTa }}dic_list&#124;dictsortreversed:'age'}}`|字典类型key反序|
|first|`{{ openTa }}dic_list&#124;first}}`|返回列表中第一个索引|
|------------------|-------------------------------------------------|---------------------------------|
|floatformat|`{{ openTa }}float_num#124;floatformat:4}}`|保留小数默认一位|
|join|`{{ openTa }}array#124;join:"-"}}`|类似python中join语法|
|last|`{{ openTa }}dic_list&#124;last}}`|返回列表最后一个|
|length|`{{ openTa }}dic_list#124;length}}`|返回长度|
|divisibleby|`{{ openTa }}count#124;divisibleby:3}}`|若被整除返回true|
|length_is|`{{ openTa }}dic_list#124;length_is:2}}`|若长度为xxx返回true|
|safe|`{{ openTa }}html_str#124;safe}}`|让服务器返回的html内容字符串在浏览器显示|
|random|`{{ openTa }}dic_list#124;random}}`|随机显示某条索引|
|slice|`{{ openTa }}html_str#124;slice:":10"}}`|切片|
|slugify|`{{ openTa }}html_str#124;slugify}}`|值小写 单词用-分割|
|------------------|-------------------------------------------------|---------------------------------|
|upper|`{{ openTa }}html_str#124;upper}}`|内容全部大写|
|urlize|`{{ openTa }}a_str#124;urlize}}`|内容链接可点击（注意空格）|
|wordcount|`{{ openTa }}first_big#124;wordcount}}`|单词数量|
|timeuntil|`{{ openTa }}feature#124;timeuntil}}`|距离当前时间的天数和小时数（未来）|


## 自定义过滤器实现  
```python
# app内新建文件夹如templateags
# 新建文件__init__.py、myfilter.py
# myfilter.py文件内：
from django import template
register = template.Labrary()

@register.filter
def test(value, args):
    return value * args
```  

> **错误记录：**

```
TypeError: expected str, bytes or os.PathLike object, not function

检查template文件夹有没有在setting文件内设置
```

> **html部分**  

```html
{{ openTag }} load myfilter %}

{{ openTa }}value|test:10}}}
```

