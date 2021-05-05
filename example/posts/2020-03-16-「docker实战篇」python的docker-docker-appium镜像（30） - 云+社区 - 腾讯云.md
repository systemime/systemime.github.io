---
title: 「docker实战篇」python的docker-docker-appium镜像（30） - 云+社区 - 腾讯云
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

> docekr 的基本命令上次讲了常用的，有老铁问我，docker 内部的容器如何让互联网访问？


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029389670-8b18e931-806b-4841-807d-1a370490062b.png#align=left&display=inline&height=402&margin=%5Bobject%20Object%5D&name=image.png&originHeight=402&originWidth=485&size=247579&status=done&style=none&width=485)<br />

<a name="5f4437df"></a>
#### 如何让互联网访问 docker


- （一）首先让 docker host 部署在公网上



> 比如你在阿里云上买了一台云主机，阿里云会给你分配 2 个地址，一个是公有的 IP 地址，一个内网的 IP 地址，公有的 IP 的地址其实就有公网的 IP 地址，这个 IP 地址是可以在互联网上进行路由的。在家里的电脑也可以上网啊，为什么我们的的服务别人访问不了，在私网肯定访问不到的。



- IPV4 和 IPV6



> 目前使用的都是 IPV4，IPV6 还在推广中。ipv4 是有限的不是每个人都可以有 ip 地址的。没有 ip 地址就不能上网，这个问题是如何解决的呢？这个涉及到一些网络方面的知识。



- NAT 技术



> 可以给一个企业分配一个公有的 ip 地址，企业内部自我规划一个私有的网络地址。例如家里的电脑连接到路由器上，路由器配置的 ip 地址就是私有的 ip 地址。内部网络如何配置没人管，自我管理，但是出口必须是分配好的 ip 地址。运营商分配的公有 ip 地址。里面涉及到一种技术 NAT 技术，网络地址 nat 地址，可以保证企业内部私有网络访问互联网，并且可以企业内部私有网络的服务器对外提供服务。这样处于私有网络的设备才能被互联网访问的到。


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029399827-d7262a4b-3123-4fc6-b10e-1774502aa394.png#align=left&display=inline&height=513&margin=%5Bobject%20Object%5D&name=image.png&originHeight=513&originWidth=963&size=99150&status=done&style=none&width=963)<br />

- 如何在 docker 内设置端口映射



> 启动虚拟机。



```
su \-
#密码vagrant
service docker restart
#后台启动一个容器httpd，容器内部端口80，映射到外部是80
docker run \-d \-p 80:80 httpd
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029411772-28663608-8969-4eaf-82f5-5b1fee99a13b.png#align=left&display=inline&height=339&margin=%5Bobject%20Object%5D&name=image.png&originHeight=339&originWidth=1080&size=289552&status=done&style=none&width=1080)<br />
<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029419212-8ddf5127-0772-4ca1-bd17-ed6ca33d2e5f.png#align=left&display=inline&height=228&margin=%5Bobject%20Object%5D&name=image.png&originHeight=228&originWidth=681&size=8802&status=done&style=none&width=681)<br />

- 在 docker 中安装 appium 中



> 如果单独在 docker 中安装 appium 很复杂，其实我们可以直接下载安装好 appium 的镜像就可以了。
> 复杂的看看网上的教程你就知道不使用 docker 镜像是多复杂 。参考网站：[https://oxygenengine.github.io/%E6%8A%80%E6%9C%AF/2017/10/18/install-auto-test-environment-on-centos-7/](https://oxygenengine.github.io/%E6%8A%80%E6%9C%AF/2017/10/18/install-auto-test-environment-on-centos-7/) 需要 10 步


<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029428274-3715d3be-09d6-47ad-ba6d-b10c06a6d8d8.png#align=left&display=inline&height=759&margin=%5Bobject%20Object%5D&name=image.png&originHeight=759&originWidth=1080&size=351916&status=done&style=none&width=1080)<br />

> docker 的方式，安装 appium



```
docker search appium
#比较大1个多g，因为之前已经设置了加速器，根据自身的网速来进行下载。
docker pull appium/appium
```

<br />![image.png](https://cdn.nlark.com/yuque/0/2021/png/663138/1620029437595-2fbb3ff7-e901-472b-ba4f-9186ca003518.png#align=left&display=inline&height=540&margin=%5Bobject%20Object%5D&name=image.png&originHeight=540&originWidth=1080&size=518012&status=done&style=none&width=1080)<br />
<br />PS：下载的过程中比较漫长，下次咱们一起看看 docker appium 如何连接 windows 下的虚拟机。<br />
<br />本文分享自微信公众号 - 编程坑太多（idig88），作者：诸葛阿明<br />
<br />原文出处及转载信息见文内详细说明，如有侵权，请联系 [yunjia_community@tencent.com](mailto:yunjia_community@tencent.com) 删除。<br />
<br />原始发表时间：2019-04-19<br />
<br />本文参与[腾讯云自媒体分享计划](https://cloud.tencent.com/developer/support-plan)，欢迎正在阅读的你也加入，一起分享。<br />[https://cloud.tencent.com/developer/article/1422066](https://cloud.tencent.com/developer/article/1422066)<br />[https://cloud.tencent.com/developer/article/1422066](https://cloud.tencent.com/developer/article/1422066)
