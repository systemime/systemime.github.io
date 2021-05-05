---
title: 哪个BBR、BBR PLUS、BBR2加速脚本最快最好 最新脚本及设置详细评测 - 虾皮路
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

2020-11-15 分类：[网站教程](https://www.shopee6.com/web/web-tutorial) 阅读 (278) 评论 (0)

[![](https://shopee6.flxzz.com/2020/11/20201115060936278.jpg!sh6)
](https://www.shopee6.com/go?_=0d5ef1350daHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDYwOTM2Mjc4LmpwZw==)

对于选购海外的 VPS 的小伙伴来说，一般海外线路有时候会不稳定，因此基本都会安装 BBR 脚本，来保证网络的加速。但是网上的 BBR 脚本非常多，哪个脚本最新最快加速效果最好呢？下面虾皮路就专门针对 BBR/BBR PLUS/BBR2 加速脚本进行对比评测。看下哪个加速脚本是最快最合适的。

## 一、什么是 BBR

TCP BBR 是谷歌出品的 TCP 拥塞控制算法。BBR 目的是要尽量跑满带宽，并且尽量不要有排队的情况。BBR 可以起到单边加速 TCP 连接的效果。替代锐速再合适不过，毕竟免费。[Google](https://www.shopee6.com/tag/170 "View all posts in Google")提交到 Linux 主线并发表在 ACM queue 期刊上的 TCP-BBR 拥塞控制算法。继承了[Google](https://www.shopee6.com/tag/170 "View all posts in Google")“先在生产环境上部署，再开源和发论文” 的研究传统。TCP-BBR 已经再 YouTube 服务器和[Google](https://www.shopee6.com/tag/170 "View all posts in Google")跨数据中心的内部广域网 (B4) 上部署。由此可见出该算法的前途。

TCP-BBR 的目标就是最大化利用网络上瓶颈链路的带宽。一条网络链路就像一条水管，要想最大化利用这条水管，最好的办法就是给这跟水管灌满水。

BBR 解决了两个问题：

再有一定丢包率的网络链路上充分利用带宽。非常适合高延迟，高带宽的网络链路。  
降低网络链路上的 buffer 占用率，从而降低延迟。非常适合慢速接入网络的用户。

项目地址:[https://github.com/google/bbr](https://www.shopee6.com/go?_=372fae6938aHR0cHM6Ly9naXRodWIuY29tL2dvb2dsZS9iYnI=)

这里虾皮路来总结一下，一般经常测试，没有设置过 BBR 的 VPS 的 G 口带宽主机，平时下载速度如果是 3MB/s 的话，安装 BBR 脚本后，一般能达到下载速度为 50-100MB/s，提速非常明显。

## 二、选择 VPS 主机及 BBR 脚本

这里虾皮路选择[ION](https://www.shopee6.com/tag/44 "View all posts in ION")的洛杉矶 VPS 主机，之前虾皮路也介绍了不少的[ION](https://www.shopee6.com/tag/44 "View all posts in ION")主机的内容，比如：[Krypt 旗下 ION 云主机洛杉矶机房最新详细评测 2G 内存 / 1T 流量 /$68 稳定建站选择](https://www.shopee6.com/hosting/vps/krypt-ion-review.html)

BBR 加速脚本虾皮路直接选择安装 Loc 论坛上的不卸载内核的 BBR 脚本

    wget -N --no-check-certificate "https://github.000060000.xyz/tcpx.sh"  && chmod +x tcpx.sh &&  ./tcpx.sh

[![](https://shopee6.flxzz.com/2020/11/20201115053849370.jpg!sh6)
](https://www.shopee6.com/go?_=e72de36cb5aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzODQ5MzcwLmpwZw==)

因为脚本比较多，但是效果基本都在 BBR 算法和 BBR PLUS 算法及 BBR2 算法几种，因此虾皮路也是主要测试这几种。

为了公平起见，每次测试完虾皮路都会重新安装一次系统，这里选择的是 Linux Centos 7 X86 64 Minimal。

[![](https://shopee6.flxzz.com/2020/11/20201115053855123.jpg!sh6)
](https://www.shopee6.com/go?_=6d95d5c21caHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzODU1MTIzLmpwZw==)

**注意：每个 VPS 主机的环境和设置都不一样，本次脚本测试仅供参考，并不具备直接指导意义，因此对自己随意安装设置 BBR 脚本所带来的后果概不负责。** 

测试的脚本虾皮路选择老鬼的测试脚本

    wget -qO- git.io/superbench.sh | bash

## 三、BBR/BBR PLUS/BBR2 加速脚本对比测试

### 1、默认的 cubic 算法脚本

先上一个未安装任何脚本的测试图，默认的机器的内核是 3.10，TCP 算法是 cubic，实际上也很不错了，就移动线路差了点

[![](https://shopee6.flxzz.com/2020/11/20201115053859465.jpg!sh6)
](https://www.shopee6.com/go?_=7db1397839aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzODU5NDY1LmpwZw==)

### 2、秋水逸冰 BBR 加速

刚开始选择流行的秋水逸冰 BBR 安装脚本进行测试

[![](https://shopee6.flxzz.com/2020/11/20201115053903934.jpg!sh6)
](https://www.shopee6.com/go?_=cc215b3e98aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTAzOTM0LmpwZw==)

安装后，上面显示的是内核提升到了 5.9.8-1.el7.elrepo.x86_64，同时为 BBR+FQ 算法。测试如下

[![](https://shopee6.flxzz.com/2020/11/20201115053907260.png!sh6)
](https://www.shopee6.com/go?_=ab8c514d70aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTA3MjYwLnBuZw==)

提速非常明显，基本都有几倍的速度的提升。

### 3、BBR 原版内核 + BBR+CAKE

这里需要安装 BBR 原版内核，不过内核升级到了 5.9.6，只不过加速算法设置成 BBR+CAKE

[![](https://shopee6.flxzz.com/2020/11/20201115053912901.png!sh6)
](https://www.shopee6.com/go?_=159811cb38aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTEyOTAxLnBuZw==)

然后运行脚本进行测试

[![](https://shopee6.flxzz.com/2020/11/20201115053916505.png!sh6)
](https://www.shopee6.com/go?_=a8cb7cb901aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTE2NTA1LnBuZw==)

提速也很不错。基本和上面的秋水逸冰 BBR 算法持平。

### 4、BBR PLUS+FQ 加速

这里要重新安装主机的内核，选择安装 BBR PLUS 的 129 版本，而不是选择 182 版本，因为很多小伙伴经常反馈，安装 182 版本后不稳定。

[![](https://shopee6.flxzz.com/2020/11/20201115053920834.png!sh6)
](https://www.shopee6.com/go?_=abae4dd412aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTIwODM0LnBuZw==)

再运行脚本进行测试

[![](https://shopee6.flxzz.com/2020/11/20201115053924283.png!sh6)
](https://www.shopee6.com/go?_=92bd33f00baHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTI0MjgzLnBuZw==)

这里虾皮路发现，内核版本在 5.9 以上，连硬盘的 IO 都高一点，目前 BBR PLUS 内核是 4.14.129，硬盘的 IO 会低一些。在提速效果这块，速度和上面差别不大。

### 5、BBR2+FQ+ECN 加速

安装完 BBR2 内核，有时候会安装不成功，安装完后记得用脚本查看一下当前加载的内核。安装成功后如下显示

[![](https://shopee6.flxzz.com/2020/11/20201115053926332.png!sh6)
](https://www.shopee6.com/go?_=832c26b9fdaHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTI2MzMyLnBuZw==)

运行脚本进行测试

[![](https://shopee6.flxzz.com/2020/11/20201115053929163.png!sh6)
](https://www.shopee6.com/go?_=f6a5216b9caHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTI5MTYzLnBuZw==)

### 6、BBR2+CAKE+ECN 加速

这里再换一个加速算法 BBR2+CAKE+ECN 加速，BBR2 的内核不动，如下

[![](https://shopee6.flxzz.com/2020/11/20201115053933439.png!sh6)
](https://www.shopee6.com/go?_=b12974d493aHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTMzNDM5LnBuZw==)

运行脚本测试

[![](https://shopee6.flxzz.com/2020/11/20201115053935658.png!sh6)
](https://www.shopee6.com/go?_=42f83235bdaHR0cHM6Ly9zaG9wZWU2LmZseHp6LmNvbS8yMDIwLzExLzIwMjAxMTE1MDUzOTM1NjU4LnBuZw==)

## 四、各个 BBR 加速脚本总结

经过上面的测试，虾皮路总结了一下各个 BBR 的加速脚本，如下

| 选择脚本 | 内核 | IO 读写平均值 | 加速效果 |
| 默认 cubic | 3.10 | 174.3MB/s | ★★ |
| 秋水逸冰 BBR(BBR+FQ) | 5.9.8 | 173.3MB/s | ★★★★ |
| BBR+CAKE | 5.9.6 | 170.0MB/s | ★★★★☆ |
| BBR PLUS+FQ | 4.14.129 | 142.7MB/s | ★★★★ |
| BBR2+FQ+ECN | 5.4.0-rc6 | 180.7MB/s | ★★★☆ |
| BBR2+CAKE+ECN | 5.4.0-rc6 | 181.3MB/s | ★★★☆ |

其实以上仅供参考，毕竟测试的时候有误差。虾皮路建议，海外的 VPS 是一定要 BBR 加速脚本的，至于安装哪个脚本，则根据个人喜好。其中用得比较多的一般是 BBR+FQ 或者 BBR+CAKE 及 BBR PLUS+FQ 这 3 个。而 BBR2 的话建议不要安装，毕竟稳定性有些不足。因此综上所述，建议选择 BBR+FQ 或者 BBR+CAKE 均可。 
 [https://www.shopee6.com/web/web-tutorial/bbr-vs-plus-vs-bbr2.html](https://www.shopee6.com/web/web-tutorial/bbr-vs-plus-vs-bbr2.html) 
 [https://www.shopee6.com/web/web-tutorial/bbr-vs-plus-vs-bbr2.html](https://www.shopee6.com/web/web-tutorial/bbr-vs-plus-vs-bbr2.html)
