---
title: 如何在Docker中使用安卓模拟器+Appium - 知乎
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

**前言**  
本篇文章会给大家讲解如何在 Docker 中使用安卓模拟器 + Appium

模拟器部署 Docker 好处有以下几点:

-   **满足将 Appium + 安卓模拟器部署带服务器的特殊需求**
-   **不需要 winserver 服务器, 同时对显卡等硬件无硬性要求, 普通服务器就可以运行**
-   **减少内存占用和性能消耗**
-   **可以实现长时间稳定的运行**
-   **虽说在 Docker 中是无界面的, 但可以通过映射端口在宿主机访问图形化界面, 方便查 Bug 和进行一些基本操作**

此镜像是个人开源项目, 目前还是存在一些问题的, 若要上生产环境请三思, 以下目前发现的问题:

-   **模拟器仅能运行支持 X86 框架的 App 安装包, Arm 的运行不起来, 虽说大神也开发了 Arm 框架的镜像, 但是好像不能用. 手机开机 1 个小时还在开机页面.**
-   **强行关闭 Docker 后, 下次启动有几率直接挂掉, 挂掉后不要用重启 (restart) 容器命令, 需要先关闭(stop), 再启动(start), 如果还不行就删掉容器, 重新开启一个**
-   **目前仅能手动安装抓包工具证书, 也就是说, 如果你要部署服务器可以, 但要用抓包工具比如 Mitmproxy 抓 Https 有点难度, 因为无法通过命令安装 Mitmproxy 的证书, 需要将证书哈希, 再经过一系列命令操作才能安装, 谷歌搜到的解决方案:**[Install User Certificate Via ADB](https://link.zhihu.com/?target=https%3A//stackoverflow.com/questions/44942851/install-user-certificate-via-adb)**, 大家有兴趣可以试下.**
-   **建议用 Linux 系统上的 Docker 来进行操作, 兼容性更好, 否则会有莫名其妙的问题**

针对兼容性问题, 目前有三个解决方案:

-   **1. 祈祷你的 App 兼容 X86, 这个看概率, 也看 App 开发者心情.**
-   **2. 找公司 Android 大神帮你改下 App 兼容配置, 然后重新打包.**
-   **3. 使用强大的[Genymotion](https://link.zhihu.com/?target=https%3A//www.genymotion.com/) , 点击传送官网, 支持和 DockerAndroid 交互, 支持云服务, 缺点是收费, 而且还不便宜.**

Appium 和模拟器环境 butomo 大神已经搞好 Docker 镜像, 我们拉下来就好了, 我们只需要执行业务逻辑相关的东西就可以.

以下是 butomo 大神的镜像 GitHub, 不稳定的传送门:

[butomo1989/docker-android​github.com![](https://pic3.zhimg.com/v2-ce637564fdbca17144c1219cd315e01e_ipico.jpg)
](https://link.zhihu.com/?target=https%3A//github.com/butomo1989/docker-android)

* * *

**正片开始**

首先是拉镜像

**寻找自己要拉的镜像版本:**

红框 Image 代表: 不同安卓版本的镜像名

橘色框代表: 控制真机的镜像名

绿色框代表: 控制 genymotion 的镜像名 (genymotion 也是一款强大的安卓模拟器, 也就是上边我说的那款, 可以免费试用, 大家可以试一试)

![](https://pic4.zhimg.com/v2-4c32fb88e047053208f4dc4e24f537e3_b.jpg)

此信息在 GitHub 链接的 ReadMe 中有, 可以直接复制

以下是**机型列表**, 除了最后一个是平板, 其他都是手机

![](https://pic4.zhimg.com/v2-d89c7986d2f0b5554230ff9a8bd75b1f_b.jpg)

此信息在 GitHub 链接的 ReadMe 中有, 可以直接复制

现在有了这两个参数, 我们就可拉镜像了.

因为在 Docker 中, 我们直接执行 run 命令, 镜像不存在它会直接帮我们拉, 所以我们可以直接执行 run 命令, 就可以了

```pycon
 docker run --privileged -d -p 6080:6080 -p 5554:5554 -p 5555:5555 -e DEVICE="Nexus 5" --name android-container butomo1989/docker-android-x86-7.1.1
```

在上边这条指令中:

**DEVICE: 设备型号, 详见我上边提供的 List of Devices 表**

**--name: 后边跟容器名, 自己随便起一个就好啦**

**最后 butomo1989 开头的那串: 是镜像名, 同样从我上边给出的镜像列表选一个就好了**

**以上命令代机型为 Nexus 5 安卓版本为 7.1.1**

命令讲解完毕后, 我们来在终端执行它, 开始下载镜像:

![](https://pic1.zhimg.com/v2-a4b3c4397674fc47d80fe80a994f6df0_b.jpg)

之后执行：docker ps -a 查看正在运行的容器, 我们可以看到容器状态是 healthy，说明容器正常启动啦

![](https://pic4.zhimg.com/v2-dad4eb4a2d130c32fca8b2526cf94e4f_b.jpg)

然后我们就成功的 Docker 中启动了一个安卓版本为 7.1.1 的安卓模拟器～

* * *

**可能会有人问：??? 这就完了?? 我咋用啊???**

哈哈，别着急，虽然在 Docker 中运行的东西是没有图形化界面的，但是注意到我们的启动命令里有个 - p6080:6080 没，这个指令将容器 6080 端口映射到了宿主机的 6080 端口。

我们在浏览器中输入：_**[http://docker-host-ip-address:6080](https://link.zhihu.com/?target=http%3A//docker-host-ip-address%3A6080/)，**_ 所以直接在浏览器访问**本机 IP + 端口**：**0.0.0.0:6080** ，效果如下 ：

![](https://pic4.zhimg.com/v2-0032c44bae4a4297e7d1723090b05bc3_b.jpg)

**这个界面里的手机，是可以直接进行操作的，和正常模拟器没什么差别。** 

但是如果我们真的要在服务器中部署安卓模拟器的话，肯定不能手动点击操作，否则为什么不用 Winserver 呢？

所以此次我们主要用图形界面来观察任务执行情况

* * *

**我们需要通过命令行指令进行操作**

首先先进入此容器内部，我们使用:

```text
docker exec -i -t 容器名或容器ID /bin/bash
```

![](https://pic4.zhimg.com/v2-d9f194b9076209c34df27ff376f90caf_b.jpg)

这样就进入容器的内部终端命令行了，其实这个镜像也是一个 Linux 系统，只不过好多所需配置如：**Appium,JDK，SDK，模拟器这些都已经自带了!!! 没错, 不用你去手动配置。** 

我们查看下 python 版本

![](https://pic3.zhimg.com/v2-ee74dc4f1fb704f85b9c499cc338caae_b.jpg)

再看看 Appium，Java,Adb 版本

![](https://pic4.zhimg.com/v2-14a3597fca1c99216508b253d12dc2c7_b.jpg)

**注意：容器没有安装 pip 和 pip3**, 我们可以执行以下指令安装.

如果要部署服务器的话，写 DockerFile 命令里也行：

```text
curl "https://bootstrap.pypa.io/3.2/get-pip.py" -o "get-pip.py"

sudo python3 get-pip.py
```

我们再执行**adb devices ，**显示如下, 设备已链接  

![](https://pic2.zhimg.com/v2-d620ef8f613e2885a54df54dda0e69fd_b.jpg)

* * *

至此我们可以看到，其实这个镜像基本把我们需要的所有东西准备的差不多了，我们需要做的只有：

1.  **安装依赖包**
2.  **安装 App 到模拟器**
3.  **执行你的代码**

首先我们把代码，App 包和 requirements.txt 放在同一个项目目录下

在终端执行（注意**不是 Docker 容器的终端，是你电脑的终端**）

```text
docker cp 本地文件路径 容器名或者ID:容器路径
如:将本地当前路径下via_test文件夹移动到名字为'android-container'的镜像的root文件夹下
docker cp  via_test/ android-container:/root
```

之后，我们再次进入容器内部， cd 到项目文件夹内。

如果**安装依赖包**，执行：

```text
pip install -r requirement.txt
```

这个应该大家都会用，就不细说了。

如果**安装 App 应用**，执行，此处我安装的是 Via 浏览器

![](https://pic1.zhimg.com/v2-a3924fb48c46a4724801127a3f1e38c4_b.jpg)

出现 success 代表成功，我们来看一下模拟器里有没有

![](https://pic3.zhimg.com/v2-78e76d6f2f5e30609497963a205fff92_b.jpg)

可以看到倒数第二排倒数第一个就是我们刚刚安装的 App

最后，我们启动 Appium，在命令行输入 apium 即可

![](https://pic2.zhimg.com/v2-f6734965137eed1e0deb7c1c81458afd_b.jpg)

最后在容器内部的命令行用 python 执行你的**Appium 脚本**就可以用 Appium 在 Docker 中控制安卓模拟器啦.

关于 Appium 脚本, 我之前帖子有讲过怎么写, 不会写的小伙伴可以传送参考, 不稳定的传送门

[程序员小景：抖音无水印视频抓取 (Appium 自动版)​zhuanlan.zhihu.com![](https://pic3.zhimg.com/v2-071251f4a0bd7dfdcfecc29868c95c96_180x120.jpg)
](https://zhuanlan.zhihu.com/p/50515738)

* * *

如果想将这一套部署到 Docker, 只需继承这个镜像, 再将以上指令编写成 DockerFile 指令就可以了, 具体我也在研究阶段, 没上过生产环境, 所以还是需要测试.

这篇文章中未解决的问题, 如果以后找到好的解决办法, 我会尽快更新, 大家在使用中发现什么问题或者好的解决方法也可以在评论区分享, 大家一起讨论~

今天就到这里, 欢迎大家订阅点赞, 如更能加个关注那就更好啦, 在此谢过~ 
 [https://zhuanlan.zhihu.com/p/50683232](https://zhuanlan.zhihu.com/p/50683232) 
 [https://zhuanlan.zhihu.com/p/50683232](https://zhuanlan.zhihu.com/p/50683232)
