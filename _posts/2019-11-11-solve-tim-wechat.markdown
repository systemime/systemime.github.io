---
layout: post
title:  "Linux下Tim/Wechat的新方案"
subtitle: 'Linux下 Tim/Wechat 的一种解决方案, 有没有猜到，就是docker'
date:   2019-11-11 20:35:13
tags: docker tim wechat
color: rgb(154,133,255)
cover: '../assets/test.png'
---
## Linux下Tim/Wechat的一种解决方案
之前通过 Wine 和 CrossOver安装过TIM，但是出现了各种的Bug 乱码，输入法无法切换，闪退等等,一直用的不爽。

今天在逛 Docker Hub 时发现了一种Linux下的Tim和Wechat解决方案

[bestwu/qq] <https://hub.docker.com/r/bestwu/qq>

**经过实践，此方法解决了上述所有的问题，安利一波**

## TIM安装过程
1. 首先当然是安装Docker，这个网上有很多教程。~~稍微琢磨一下肯定可以弄出来，再搞个镜像加速什么的，很简单。~~

可以参考 [Parrotsec下 Docker](https://parrotsec-cn.org/t/parrotsec-docker/2494) 解决方案

当你输入如下内容时，出现如图输出内容，说明Docker安装成功

{% highlight bash %}
sudo docker run hello-world
{% endhighlight %}

![p1](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p1.jpeg)

2. 然后从`Docker Hub` 上获取 `bestwu/qq`
命令行中输入如下内容
{% highlight bash %}
sudo docker pull bestwu/qq
{% endhighlight %}

![p2](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p2.png)

~~这里我已经获取过了，第一次可能要稍微等待一会儿~~

3. 接着获取audio的组ID，下面会用到
命令行中输入如下内容
{% highlight bash %}
getent group audio | cut -d: -f3
{% endhighlight %}

![p3](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p3.png)

parrotsec系统中，值为 29

4. 接下来创建一个yml文件，比如说这里创建 docker-tim.yml，添加如下内容
{% highlight bash %}
vim docker-tim.yml
{% endhighlight %}

{% highlight bash %}
version: '2'
services:
 qq:
   image: bestwu/qq:office    # 后面这个 office 改成 latest ， 登录的就是QQ，否则是Tim
   container_name: qq
   devices:
     - /dev/snd #声音
   volumes:
     - /tmp/.X11-unix:/tmp/.X11-unix
     - $HOME/TencentFiles:/TencentFiles
   environment:
     - DISPLAY=unix$DISPLAY
     - XMODIFIERS=@im=fcitx #中文输入
     - QT_IM_MODULE=fcitx
     - GTK_IM_MODULE=fcitx
     - AUDIO_GID=29 # 可选 (29 parrotsec) 主机audio gid 解决声音设备访问权限问题
     - GID=$GID # 可选 默认1000 主机当前用户 gid 解决挂载目录访问权限问题
     - UID=$UID # 可选 默认1000 主机当前用户 uid 解决挂载目录访问权限问题
{% endhighlight %}

![p4](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p4.png)

5. 最后通过该配置文件启动即可
命令行中输入如下内容
{% highlight bash %}
sudo docker-compose -f docker-tim.yml up
{% endhighlight %}

![p5](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p5.png)

6. 桌面自动跳出TIM登录界面
![p6](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p6.png)

7. 登录即可，你会发现各种功能都是正常的
![p7](https://github.com/systemime/my_image/blob/master/Solve-Tim-WeChat/p7.png)

## Wechat安装

Wechat安装过程与Tim完全相同，你可以在

[bestwu/Wechat] <https://hub.docker.com/r/bestwu/wechat>

中找到相关内容, 不多说了

## 参考来源
[bestwu] <https://hub.docker.com/r/bestwu/>
