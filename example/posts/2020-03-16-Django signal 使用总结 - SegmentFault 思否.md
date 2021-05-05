---
title: Django signal 使用总结 - SegmentFault 思否
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

本文最早发表于个人博客 [Pylixm'wiki-django signal 使用总结](https://pylixm.cc/posts/2017-01-24-Django-signal.html)

最近在已经开发好的项目上加功能，想到了 django 的 signal，整理记录如下备查。

## 什么是 django 的 signal

官方文档描述如下：

> Django includes a “signal dispatcher” which helps allow decoupled applications get notified when actions occur elsewhere in the framework.In a nutshell, signals allow certain senders to notify a set of receivers that some action has taken place. They’re especially useful when many pieces of code may be interested in the same events.

Django 内部包含了一位 “信号调度员”：当某事件在框架内发生时，它可以通知到我们的应用程序。 简而言之，当 event（事件）发生时，signals（信号）允许若干 senders（寄件人）通知一组 receivers（接收者）。这在我们多个独立的应用代码对同一事件的发生都感兴趣时，特别有用。

个人理解，django 的 signal 可理解为 django 内部的钩子，当一个事件发生时，其他程序可对其作出相关反应，可通过 signal 来回调定义好的处理函数（receivers），从而更大程度的解耦我们的系统。

## 最佳使用场景

### 通知类　

通知是 signal 最常用的场景之一。例如，在论坛中，在帖子得到回复时，通知楼主。从技术上来讲，我们可以将通知逻辑放在回复保存时，但是这并不是一个好的处理方式，这样会时程序耦合度增大，不利于系统的后期扩展维护。如果我们在回复保存时，只发一个简单的信号，外部的通知逻辑拿到信号后，再发送通知，这样回复的逻辑和通知的逻辑做到了分开，后期维护扩展都比较容易。

### 初始化类

信号的另一个列子便是事件完成后，做一系列的初始化工作。

### 其他一些使用场景总结

以下情况不要使用 signal:

-   signal 与一个 model 紧密相关, 并能移到该 model 的 save() 时
-   signal 能使用 model manager 代替时
-   signal 与一个 view 紧密相关, 并能移到该 view 中时

以下情况可以使用 signal:

-   signal 的 receiver 需要同时修改对多个 model 时
-   将多个 app 的相同 signal 引到同一 receiver 中处理时
-   在某一 model 保存之后将 cache 清除时
-   无法使用其他方法, 但需要一个被调函数来处理某些问题时

## 如何使用

django 的 signal 使用可分为 2 个模块：

-   signal ：signal 定义及触发事件
-   receiver : signal 接受函数

### 内建 signal 的使用

django 内部有些定义好的 signal 供我们使用：

模型相关：

-   pre_save 对象 save 前触发
-   post_save 对象 save 后触发
-   pre_delete 对象 delete 前触发
-   post_delete 对象 delete 后触发
-   m2m_changed ManyToManyField 字段更新后触发

请求相关：

-   request_started 一个 request 请求前触发
-   request_finished request 请求后触发

针对 django 自带的 signal，我们只需要编写 receiver 即可，使用如下。

#### 第一步，编写 receiver 并绑定到 signal

`myapp/signals/handlers.py`

    from django.dispatch import receiver
    from django.core.signals import request_finished
     

    @receiver(request_finished, dispatch_uid="request_finished")
    def my_signal_handler(sender, **kwargs):
        print("Request finished!================================")

    def my_signal_handler(sender, **kwargs):
        print("Request finished!================================")

    request_finished.connect(my_signal_handler)

    from django.dispatch import receiver
    from django.db.models.signals import post_save
     
    from polls.models import MyModel
     
     
    @receiver(post_save, sender=MyModel, dispatch_uid="mymodel_post_save")
    def my_model_handler(sender, **kwargs):
     print('Saved: {}'.format(kwargs['instance'].__dict__)) 

-   dispatch_uid 确保此 receiver 只调用一次

#### 第二步，加载 signal

`myapp/__init__py`

    default_app_config = 'myapp.apps.MySendingAppConfig'

`myapp/apps.py`

    from django.apps import AppConfig
     
     
    class MyAppConfig(AppConfig):
        name = 'myapp'
     
        def ready(self):
            
            import myapp.signals.handlers

到此，当系统受到 request 请求完成后，便会执行 receiver。

其他内建的 signal，参考官方文档：  
[https://docs.djangoproject.com/en/1.9/topics/signals/](https://docs.djangoproject.com/en/1.9/topics/signals/)

### 自定义 signal 的使用

自定义 signal，需要我们编写 signal 和 receiver 。

#### 第一步, 编写 signal

`myapp.signals.signals.py`

    import django.dispatch
     
    my_signal = django.dispatch.Signal(providing_args=["my_signal_arg1", "my_signal_arg_2"])

#### 第二步，加载 signal

`myapp/__init__py`

     default_app_config = 'myapp.apps.MySendingAppConfig'

`myapp/apps.py`

    from django.apps import AppConfig
     
     
    class MyAppConfig(AppConfig):
        name = 'myapp'
     
        def ready(self):
            
            import myapp.signals.handlers

#### 第三步，事件触发时，发送 signal

`myapp/views.py`

    from .signals.signals import my_signal
     
    my_signal.send(sender="some function or class",
                   my_signal_arg1="something", my_signal_arg_2="something else"])

自定义的 signal，django 已经为我们编写了此处的事件监听。

#### 第四步，收到 signal，执行 receiver

`myapp/signals/handlers.py`

    from django.dispatch import receiver
    from myapp.signals.signals import my_signal
     
     
    @receiver(my_signal, dispatch_uid="my_signal_receiver")
    def my_signal_handler(sender, **kwargs):
        print('my_signal received') 

此时，我们自定义的 signal 便开发完成了。

## 总结

-   django signal 的处理是同步的，勿用于处理大批量任务。
-   django signal 对程序的解耦、代码的复用及维护性有很大的帮助。

以上为个人观点，如有疑问欢迎交流。

## 参考

[http://sabinemaennel.ch/django/signals-in-django/](http://sabinemaennel.ch/django/signals-in-django/)  
[https://docs.djangoproject.com/en/1.10/topics/signals/](https://docs.djangoproject.com/en/1.10/topics/signals/)  
[http://www.weiguda.com/blog/38/](http://www.weiguda.com/blog/38/)  
[http://www.python88.com/topic/151](http://www.python88.com/topic/151) 
 [https://segmentfault.com/a/1190000008455657](https://segmentfault.com/a/1190000008455657) 
 [https://segmentfault.com/a/1190000008455657](https://segmentfault.com/a/1190000008455657)
