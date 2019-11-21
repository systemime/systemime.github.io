---
layout: post
title: 'django2.2使用jinja配置'
date: 2019-11-20 18:40:59
author: qifeng
color: rgb(255,210,32)
cover: '../assets/jinja.png'
tags: jinja django
---
## 使用jinja2.Jinja2代替django.DjangoTemplates

> django2.1.2以前的版本中，django可以将原来的DjangoTempaltes模板引擎直接替换为jinja引擎,但是在django2.2.6版本中测试只能采用新增jinja模板的方式，不能直接替换，否则会产生如下错误,其他版本暂未测试，以下内容仅供参考  

```
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
