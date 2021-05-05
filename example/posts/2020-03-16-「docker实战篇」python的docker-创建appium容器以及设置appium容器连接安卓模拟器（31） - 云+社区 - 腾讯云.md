---
title: 「docker实战篇」python的docker-创建appium容器以及设置appium容器连接安卓模拟器（31） - 云+社区 - 腾讯云
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

> 上一节已经下载好了 appium 的镜像，接下来说下如何创建 appium 如何创建容器和模拟器如何连接 appium 容器。源码：[https://github.com/limingios/dockerpython.git](https://github.com/limingios/dockerpython.git) （源码 /「docker 实战篇」python 的 docker - 创建 appium 容器以及设置 appium 容器连接安卓模拟器（30））


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029036857-d2ef28f5-aa4e-443e-b597-30941206d91d.png#align=left&display=inline&height=246&margin=%5Bobject%20Object%5D&name=image.png&originHeight=246&originWidth=445&size=95827&status=done&style=none&width=445)<br />

- appium 的 docker 镜像的介绍



> 官网地址：[https://github.com/appium/appium-docker-android](https://github.com/appium/appium-docker-android)


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029046682-a8f0b731-a499-4f3c-8cad-36ec71080373.png#align=left&display=inline&height=762&margin=%5Bobject%20Object%5D&name=image.png&originHeight=762&originWidth=1080&size=370751&status=done&style=none&width=1080)<br />

- 启动 appium 容器<br />docker run --privileged -d -p 4723:4723 --name appium1 appium/appium


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029055717-b1a9a8b3-c6d5-4fe5-8094-b04aa6c03329.png#align=left&display=inline&height=405&margin=%5Bobject%20Object%5D&name=image.png&originHeight=405&originWidth=1080&size=311764&status=done&style=none&width=1080)<br />

> 说明启动成功


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029064586-f29fe23e-91eb-412d-85ca-30aff3565c73.png#align=left&display=inline&height=182&margin=%5Bobject%20Object%5D&name=image.png&originHeight=182&originWidth=568&size=6201&status=done&style=none&width=568)<br />

- 容器启动后，启动安卓模拟器



> 启动安卓模拟器后，通过 cmd 输入



```
adb devices
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029074411-5b0e1fb0-9f8b-404a-8b85-2dc980470a8e.png#align=left&display=inline&height=829&margin=%5Bobject%20Object%5D&name=image.png&originHeight=829&originWidth=606&size=399205&status=done&style=none&width=606)<br />

> 改变连接方式，从 usb 更改为 tcp-ip 的方式



```
adb \-s 127.0.0.1:62001 tcpip 55555
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029089463-07349ab1-45e3-4ef2-9452-4b2ae1f1032d.png#align=left&display=inline&height=221&margin=%5Bobject%20Object%5D&name=image.png&originHeight=221&originWidth=529&size=9792&status=done&style=none&width=529)<br />

> 使用 docker 的 appium 连接模拟器 1. 设置成桥接


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029106494-caf82caa-9086-4185-914d-bc502bb1128b.png#align=left&display=inline&height=1041&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1041&originWidth=575&size=342980&status=done&style=none&width=575)<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029116373-47b186e4-9f94-40a7-9353-669ea1d38764.png#align=left&display=inline&height=556&margin=%5Bobject%20Object%5D&name=image.png&originHeight=556&originWidth=736&size=39649&status=done&style=none&width=736)<br />

> 重启模拟器，可能无法获取 ip，点击下开关，然后自动获取下就可以了。


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029130369-1b077f28-4c50-47c2-bbe6-3c262deefddc.png#align=left&display=inline&height=1020&margin=%5Bobject%20Object%5D&name=image.png&originHeight=1020&originWidth=558&size=92818&status=done&style=none&width=558)<br />
<br />2. 查看模拟器的 ip 地址<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029137998-3d41f351-23df-4e06-97fa-0428d4299942.png#align=left&display=inline&height=749&margin=%5Bobject%20Object%5D&name=image.png&originHeight=749&originWidth=569&size=106689&status=done&style=none&width=569)<br />

1. 虚拟机 docker 连接模拟器<br />ping 192.168.1.120<br />docker exec -it appium1 adb connect 192.168.1.120:55555<br />docker exec -it appium1 adb devices


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029148266-74b3f5f3-9760-48bb-b08a-a194ad719a3e.png#align=left&display=inline&height=173&margin=%5Bobject%20Object%5D&name=image.png&originHeight=173&originWidth=756&size=25492&status=done&style=none&width=756)<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029156947-d4b11ed6-2056-4d7f-840a-91c456e12433.png#align=left&display=inline&height=98&margin=%5Bobject%20Object%5D&name=image.png&originHeight=98&originWidth=1080&size=37140&status=done&style=none&width=1080)<br />
<br />4. 测试 python，运行 docker appium，运行模拟器<br />

> 启动



```
docker ps \-a
docker logs \-f appium1
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029167097-439919d3-876b-4621-a5ff-30d36250f488.png#align=left&display=inline&height=271&margin=%5Bobject%20Object%5D&name=image.png&originHeight=271&originWidth=1080&size=305474&status=done&style=none&width=1080)<br />

> python 代码



```
#!/usr/bin/env python
# \-\*\- coding: utf\-8 \-\*\-
# @Time    : 2019/3/12 15:11
# @Author  : Aries
# @Site    :
# @File    : aaa.py
# @Software: PyCharm

from appium import webdriver

cap \= {
        "platformName": "Android",
        "platformVersion": "4.4.2",
        "deviceName": "192.168.1.120:55555",
        "udid":"192.168.1.120:55555",
        # 真机的
        # "platformName": "Android",
        # "platformVersion": "7.1.2",
        # "deviceName": "10d4e4387d74",
        "appPackage": "com.ss.android.ugc.aweme",
        "appActivity": "com.ss.android.ugc.aweme.main.MainActivity",
        "noReset": True,
        "unicodeKeyboard": True,
        "resetkeyboard": True
    }

driver \= webdriver.Remote("http://192.168.70.100:4723/wd/hub", cap)
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029195680-6c3ba948-9769-4cdd-8609-053ac166a9e2.png#align=left&display=inline&height=624&margin=%5Bobject%20Object%5D&name=image.png&originHeight=624&originWidth=1080&size=311256&status=done&style=none&width=1080)
> 运行通过

![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029178703-82f8c975-d1c6-4039-84ed-163b11ab5022.png#align=left&display=inline&height=588&margin=%5Bobject%20Object%5D&name=image.png&originHeight=588&originWidth=1080&size=983894&status=done&style=none&width=1080)<br />
<br />PS：通过 docker appium 的方式运行远程的虚拟机，真机也是一样啊，先通过 adb devices，找到后，然后改成 tcpip 的形式，让 docker appium 连接 设备，代码设置里面区别，基本就是这样。<br />
<br />本文分享自微信公众号 - 编程坑太多（idig88），作者：诸葛阿明<br />
<br />原文出处及转载信息见文内详细说明，如有侵权，请联系 [yunjia_community@tencent.com](mailto:yunjia_community@tencent.com) 删除。<br />
<br />原始发表时间：2019-04-20<br />
<br />本文参与[腾讯云自媒体分享计划](https://cloud.tencent.com/developer/support-plan)，欢迎正在阅读的你也加入，一起分享。<br />[https://cloud.tencent.com/developer/article/1422068](https://cloud.tencent.com/developer/article/1422068)<br />[https://cloud.tencent.com/developer/article/1422068](https://cloud.tencent.com/developer/article/1422068)
