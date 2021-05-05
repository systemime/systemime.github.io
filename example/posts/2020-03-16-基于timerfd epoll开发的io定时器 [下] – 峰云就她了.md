---
title: 基于timerfd epoll开发的io定时器 [下] – 峰云就她了
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

> 接着上下文

接着上文， 上次内容是说 epoll timerfd 的原理和函数方法，下文主要是 python epoll timerfd 的之间的调用.

该文章写的有些乱，欢迎来喷 ! 另外文章后续不断更新中，请到原文地址查看更新.

[http://xiaorui.cc/?p=3693](http://xiaorui.cc/?p=3693)

在描述之前，我再次老生常谈关于 timerfd 的原理。 我们的 timerfd_create() 把时间变成了一个文件描述符，该文件描述符会在超时时变得可读，这种特性可以使我们在写服务器程序时，很方便的便把定时事件变成和其他 I/O 事件一样的处理方式，并且此定时接口的精度也足够的高，所以我们只要以后在写 I/O 框架时用到了定时器就该首选。

timerstack 是我新起的一个项目，就是这三个关键词 python timerfd epoll ，简单说就是实现了高性能的 IO 定时器….    

原先我用空闲时间自己用 Pyobject 封装 timerfd 的 python 接口，再排除问题时，搜到在 google code 代码库有 python timerfd 的模块，但问题是….   是有问题的….   问题主要体现在，重新赋值时 settime 异常, 把定时任务改成周期性任务也存在有问题…    我在上文中有聊过这个话题。 结合未写完的 PyObject 进行 C 库改造。 话说这类问题虽然很小，但真觉得是闹事 …   留坑玩呀…

> 项目介绍:

项目名， timerstack

项目地址， [https://github.com/rfyiamcool/timerstack](https://github.com/rfyiamcool/timerstack)

> timestack 的安装

安装方法:

    pip install timerstack

源码安装:

    #xiaorui.cc

    git clone https://github.com/rfyiamcool/timerstack.git
    cd timerstack
    python setup.py install

> 函数介绍

timerstack.create(): 创建一个相对时间的定时器 fd 

timerstack.settime(): 设置新旧时间，可以简单理解为间隔时间和次数. 

timerstack.gettime(): 查看模式

    #xiaorui.cc

    import timerstack,os
    f = timerstack.create(timerfd.CLOCK\_REALTIME,0)
    timerstack.settime(f,0,10,0)    #单次 10s
    timerstack.settime(f,0,0,0)      #停止
    timerstack.settime(f,0,5,5)      #每5秒钟轮一次,次数不限制
    os.read(f,1024)

下面是比较完整的使用方法，另外开源的版本功能有些简单，主要是线上的调度代码虽然看起来强大，但奈何还未整理，直接塞到 github 中， 有失颜面呀 …   上次分享了一个关于 web 框架，好悬没让人喷死.  不是功能不能用，是用起来很别扭….

早已经开发好的线程池和函数映射类的功能，下个版本加入该功能. 

    #coding:utf-8
    #xiaorui.cc
    import os
    import time
    import logging
    import select
    import functools

    import timerstack


    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(\_\_name\_\_)

    func\_map = {}


    def go(\*args):
        logger.info(args)


    def test():
        for i in range(100000):
            i += 10
            f = timerstack.create(timerstack.CLOCK\_REALTIME,0)
            timerstack.settime(f,0,i,i)
            func\_map\[f\] = functools.partial(go, i)
        
        f = timerstack.create(timerstack.CLOCK\_REALTIME,0)
        timerstack.settime(f,0,10,0) #only once
        func\_map\[f\] = functools.partial(go, i)
        run(func\_map.keys())


    def run(inputs):
        outputs = \[\]
        try:
            # 创建 epoll 句柄
            epoll\_fd = select.epoll()
            # 向 epoll 句柄中注册 监听 socket 的 可读 事件
            for ff in inputs:
                epoll\_fd.register(ff, select.EPOLLIN)
        except select.error, msg:
            logger.error(msg)

        while True:
            epoll\_list = epoll\_fd.poll()
            for fd, events in epoll\_list:
                func\_map\[fd\]()

        
    def io\_select():
        while inputs:
            readable , writable , exceptional = select.select(inputs, outputs, inputs, 0.1)
            for s in readable:
                os.read(s,1024)
                func\_map\[s\](123)
        

    if \_\_name\_\_ == "\_\_main\_\_":
        test()

END.

* * *

大家觉得文章对你有些作用！ 如果想赏钱，可以用微信扫描下面的二维码，感谢!  
另外再次标注博客原地址  [xiaorui.cc](http://xiaorui.cc/)  

![](http://static.xiaorui.cc/static/weixin_new.jpg) 
 [http://xiaorui.cc/archives/3693](http://xiaorui.cc/archives/3693) 
 [http://xiaorui.cc/archives/3693](http://xiaorui.cc/archives/3693)
