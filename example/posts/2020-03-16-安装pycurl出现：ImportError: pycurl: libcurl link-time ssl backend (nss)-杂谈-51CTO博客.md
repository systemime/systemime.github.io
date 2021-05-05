---
title: 安装pycurl出现：ImportError：pycurl：libcurl link-time ssl backend (nss)-杂谈-51CTO博客
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

系统版本 CentOS release 6.2 (Final)

今天用 pip 安装 pycurl 是出现如下情况：

[![](https://s3.51cto.com/wyfs02/M00/73/74/wKiom1X-ehuzQ83nAAHJODbs9jo522.jpg)
](https://s3.51cto.com/wyfs02/M00/73/74/wKiom1X-ehuzQ83nAAHJODbs9jo522.jpg)

要解决这个问题就是要指定 ssl 的方式，nss、openssl 等

搜罗的一些方法：

法一：

1、如果没有安装 pip, 先安装 pip；  
2、pip uninstall pycurl 卸载掉之前安装的；  
3、执行 export PYCURL_SSL_LIBRARY=nss；  
4、pip install pycurl 再次安装

PS：也可能不是出现 nss，而是 openssl，只要对应改成 openssl 就可以了

法二：

用源码安装，但是需要 curl-config 包支持，所以源码重新安装 curl

 wget [http://curl.haxx.se/download/curl-7.36.0.tar.gz](http://curl.haxx.se/download/curl-7.36.0.tar.gz)

安装过程略

之后 export LD_LIBRARY_PATH=/us/local/lib

curl -O [https://pypi.python.org/packages/source/p/pycurl/pycurl-7.19.3.1.tar.gz](https://pypi.python.org/packages/source/p/pycurl/pycurl-7.19.3.1.tar.gz)

tar -zxvf pycurl-7.19.3.1.tar.gz

cd pycurl-7.19.3.1

python setup.py install --curl-config=/usr/local/bin/curl-config

安装完成！

通过法一没办法解决，不知道为什么，法二可以解决。 
 [https://blog.51cto.com/hyc123no1/1696533](https://blog.51cto.com/hyc123no1/1696533)
