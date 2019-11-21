---
layout: post
title:  "django2.2使用jinja模板"
subtitle: 'django2.2使用jinja和以前的django版本中有些区别，这里顺便会说明'
date:   2019-11-21 15:33:13
tags: django jinja template
color: rgb(154,133,255)
cover: ''
---
## 使用jinja2.Jinja2代替django.DjangoTemplates

> **必须注意的地方：** 在django2.1.2以前的版本中，django可以将原来的DjangoTempaltes模板引擎直接替换为jinja引擎，
> 但是在django2.2.6版本中测试只能采用新增jinja模板的方式，不能直接替换，否则会产生如下错误，
> 其他版本暂未测试，以下内容仅供参考  
```text
ERRORS:
?: (admin.E403) A 'django.template.backends.django.DjangoTemplates' instance must be configured in TEMPLATES in order to use the admin application.
```
以下是具体配置

1. **应用app内创建`base_jinja.py`**
2. **新建jinja路由内容**  
    ```python
    #coding:utf-8

    from jinja2 import Environment
    from django.contrib.staticfiles.storage import staticfiles_storage
    from django.urls import reverse
    # 该部分代码来自django、jinja广泛文档介绍，类似基础配置  
    
    def environment(**options):
        env = Environment(**options)
        
        # 全局的数据，路由
        env.globals.update({
            'static': staticfiles_storage.url,
            'url': reverse
        })
        return env
    ```

3. **~~在setting中修改templates配置~~** 在setting中添加如下配置  
    [`Django`文档中有关`jinja`的说明](https://docs.djangoproject.com/en/2.2/topics/templates/#django.template.backends.django.DjangoTemplates)  
    3.1 新增模板引擎  
    3.2 添加其他参数  
    3.3 完整配置如下  
    ```python
    TEMPLATES = [
        {
            'BACKEND': 'django.template.backends.django.DjangoTemplates',
            'DIRS': [],
            'APP_DIRS': True,
            'OPTIONS': {
                'context_processors': [
                    'django.template.context_processors.debug',
                    'django.template.context_processors.request',
                    'django.contrib.auth.context_processors.auth',
                    'django.contrib.messages.context_processors.messages',
                ],
            },
        },
        {
            'BACKEND': 'django.template.backends.jinja2.Jinja2',  # jinja模板引擎
            'DIRS': [os.path.join(BASE_DIR, 'templates')],  # 可以使用app内的template自定义文件夹
            'APP_DIRS': True,
            'OPTIONS': {
                'environment': 'myjinjia.base_jinja.environment',  # 添加jinja2模板引擎虚拟环境
                'context_processors': [
                   # 默认为空即可,具体配置参考django文档
                ],
            },
        }
    ]
    ```
4. 启动  
    > **注意：** `jinja` **不建议与** `django` **的上下文处理器一起使用**  

5. jinja模板语法  

    |名称|描述|  
    |---|----|  
    |title|首字母大写|
    |...|...|
      
6. html中的使用
   * 没有`{% load %}`的方法，增加会报错
   * 引入cssjs直接 `{% block css_style %}` 即可  
       ```html
       {% extends "base.html" %}
        
        
        {% block css_style %}
        <link rel="stylesheet" href="/static/test.css" />
        {% endblock %}
        
        {% block content %}
            {{ name|title }}
        {% endblock %}
        ```
   * 过滤器传参数使用括号
        ```html
        {{ age|test(int_type num) }}
        ```
   
6. 自定义过滤器  
    * 同app下新建myfilter.py文件，内容如下
        ```python
        #cofing:utf-8
        
        def test(value, args):
            return value * args
        ```  
   
    * 在base_jinja.py中增加自定义过滤器信息
        ```python
        #coding:utf-8
        from django.templatetags.static import static
        from django.urls import reverse
        
        from jinja2 import Environment
        
        from .myfilter import test
        # 新增
        
        def environment(**options):
            env = Environment(**options)
            env.globals.update({
                'static': static,
                'url': reverse,
            })
            env.filters['test'] = test
            # 新增
        
            return env
        ```
    
    * 在html中
        ```html
        {{ age|test(int_type num) }}
        ```