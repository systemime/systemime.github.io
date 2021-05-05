---
title: Bbr、bbr2、bbrplus、锐速内核一键安装脚本更新测试版。 - 笨猫博客
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

## 开启 BBR 有什么用？

简单来说，开启 BBR 可以对你网站访问速度起到一定的优化。例如奶爸的笔记使用的是 WordPress，通过 BBR 也可以给 WordPress 网站进行一定的加速优化，当然，奶爸采用的国内服务器，所以 BBR 加速效果也不会有多明显。

BBR 是 Google 开源的一种 TCP 网络拥塞优化算法，TCP BBR 致力于解决两个问题：在有一定丢包率的网络链路上充分利用带宽。降低网络链路上的 buffer 占用率，从而降低延迟。TCP 拥塞控制的目标是最大化利用网络上瓶颈链路的带宽。

开源地址：[https://github.com/google/bbr](https://github.com/google/bbr)

## BBR 和 BBR2 一键包

### 什么是 BBR2？

BBR2 目前还是预览版，是 BBR 的升级版本，目前还不够成熟，不建议生产环境使用。

BBR2 详细说明参见：[https://github.com/google/bbr/blob/v2alpha/README.md](https://github.com/google/bbr/blob/v2alpha/README.md)

## 一键脚本安装：

![](https://www.nbmao.com/wp-content/uploads/2020/02/QQ%E5%9B%BE%E7%89%8720200208155449.png)

一、安装证书  
#debian&ubuntu

> apt-get -y install ca-certificates

\#centos

> yum -y install ca-certificates

二、安装内核  
不卸载内核（安全，若出现不能启动等，可 VNC 换启动内核）

> wget -N --no-check-certificate "[https://github.com/ylx2016/Linux-NetSpeed/raw/master/tcpx.sh](https://github.com/ylx2016/Linux-NetSpeed/raw/master/tcpx.sh)" && chmod +x tcpx.sh && ./tcpx.sh

卸载内核

> wget -N --no-check-certificate "[https://github.com/ylx2016/Linux-NetSpeed/raw/master/tcp.sh](https://github.com/ylx2016/Linux-NetSpeed/raw/master/tcp.sh)" && chmod +x tcp.sh && ./tcp.sh

### 更新脚本内容

1.bbr 内核更新为 5.5/5.4  
2.bbrplus 内核更新为 4.14.168  
3.bbr/bbrplus 对应的 centos6,7,8 debian8,9,10  ubuntu16,18,19 都是对应一一编译的  
4. 不支持 32 位系统，锐速内核稍微更新，  
5. 去掉魔改版 增加 xanmod 5.5.1 版本 xanmod 只添加了 centos7,8 debian9,10  
6.5.5 内核支持 cake 队列 5.4 未测试

测试版本，建议先用不卸载内核版本测试，然后再用正常版本  
不卸载内核表示不会去卸载现有的内核  
三、相关问题

1、双持 bbr + 锐速  
bbr 添加

> echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf  
> echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf  
> sysctl -p

编辑锐速文件

> nano /appex/etc/config

检测代码有 BUG，如果锐速正常运行查看

> bash /appex/bin/lotServer.sh 状态 | grep“LotServer”

检查 bbr ?

> lsmod | grep bbr

查看当前支持 TCP 算法

> cat /proc/sys/net/ipv4/tcp_allowed_congestion_control

查看当前运行的算法

> cat /proc/sys/net/ipv4/tcp_congestion_control

命令： uname -a  
作用： 查看系统内核版本号及系统名称  
命令： cat /proc/version  
作用： 查看目录 "/proc" 下 version 的信息，也可以得到当前系统的内核版本号及系统名称

测试分支  
[https://github.com/ylx2016/Linux-NetSpeed/tree/2020.2.3](https://github.com/ylx2016/Linux-NetSpeed/tree/2020.2.3)  
[https://github.com/ylx2016/Linux-NetSpeed/releases](https://github.com/ylx2016/Linux-NetSpeed/releases)

原作者  
[https://github.com/cx9208/Linux-NetSpeed](https://github.com/cx9208/Linux-NetSpeed)  
[https://github.com/chiakge/Linux-NetSpeed](https://github.com/chiakge/Linux-NetSpeed) 
 [https://www.nbmao.com/archives/3767](https://www.nbmao.com/archives/3767) 
 [https://www.nbmao.com/archives/3767](https://www.nbmao.com/archives/3767)
