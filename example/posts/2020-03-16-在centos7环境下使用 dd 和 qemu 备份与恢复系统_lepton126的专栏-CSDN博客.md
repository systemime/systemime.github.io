---
title: 在centos7环境下使用 dd 和 qemu 备份与恢复系统_lepton126的专栏-CSDN博客
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

![](https://csdnimg.cn/release/blogv2/dist/pc/img/original.png)

[lepton126](https://lepton126.blog.csdn.net/) 2020-10-10 12:31:29 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/articleReadEyes.png)
 115 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect.png)
 收藏 

版权声明：本文为博主原创文章，遵循 [CC 4.0 BY-SA](http://creativecommons.org/licenses/by-sa/4.0/) 版权协议，转载请附上原文出处链接和本声明。

一、使用 dd 备份系统盘, 在需要备份的设备上，将备份硬盘挂载在 / dev/sdc，具体情况可能因设备不同而不同，大都是最后一块

dd if=/dev/sda of=/dev/sdc/hostaa.img

二、在 centos7 安装 qemu

确保 cpu 支持虚拟

grep vmx /proc/cpuinfo

有输出则表示支持

安装组件

yum install git glib2-devel libfdt-devel pixman-devel zlib-devel

yum install gtk3-devel

yum install vte-devel

yum install libaio-devel libcap-devel libiscsi-devel libvirt-devel

更改为阿里云 yum 源

cd /etc/yum.repos.d

mv /etc/yum.repos.d/CentOS-Base.repo /etc/yum.repos.d/CentOS-Base.repobak

wget -O /etc/yum.repos.d/CentOS-Base.repo [http://mirrors.aliyun.com/repo/Centos-7.repo](http://mirrors.aliyun.com/repo/Centos-7.repo)

epel 源

wget [https://mirrors.aliyun.com/repo/epel-7.repo](https://mirrors.aliyun.com/repo/epel-7.repo)

yum clean all && yum makecache

安装 qemu

yum install qemu -y

三、查询状态 

service libvirtd status

若没有启动，则启动服务

service libvirtd start

执行

virt-manager

进行界面，新建虚拟机 -> 本地安装介质，选择 dd 命令生成的 hastaa.img

[https://blog.csdn.net/xtggbmdk/article/details/82706380?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param](https://blog.csdn.net/xtggbmdk/article/details/82706380?utm_medium=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-BlogCommendFromMachineLearnPai2-1.channel_param)

[https://www.cnblogs.com/wanghuaijun/p/5531512.html](https://www.cnblogs.com/wanghuaijun/p/5531512.html)

这是两篇不错的参考文档 
 [https://blog.csdn.net/lepton126/article/details/108993070](https://blog.csdn.net/lepton126/article/details/108993070) 
 [https://blog.csdn.net/lepton126/article/details/108993070](https://blog.csdn.net/lepton126/article/details/108993070)
