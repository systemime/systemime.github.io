---
title: CentOS 7 使用rclone挂载谷歌团队网盘（Google Team Drive） - OMO萌
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

Loading...

[![](https://omo.moe/usr/uploads/2018/04/2016-05-02-012805.jpg)
](https://omo.moe/usr/uploads/2018/04/2016-05-02-012805.jpg)

[请输入图片描述](https://omo.moe/usr/uploads/2018/04/2016-05-02-012805.jpg)

**2020/08/06 日更新：关于 Rclone 系列现已更新更为完整强大的各种工具安装流程，点击查阅：** 

简单说下谷歌云盘教育版（edu 邮箱）与 gsuite 授权普通账号团队盘的区别和各种毛病：

edu 有免费申请的（非常容易翻车），或者通过特殊渠道拿美国等社区大学现成账号（或许 py 交易之类的），这样花费 0-30 元不等就可以拿到一个无限空间云盘了

gsuite 授权，具体操作属于大佬商业机密，不懂细节，原理是购买了 gsuite 套餐的企业或者公司分配授权团队协作到你的普通谷歌账号，不用你自己付费升级到 gsuite 账号，也不用重新登陆新的谷歌号，就可以让你自己常用谷歌账号获得一个无限空间团队云盘，普通玩家获得的成本一般为 50-150 元左右，获得的渠道和内在区别，不明!

那么说下两者各自的不足：

edu 教育版，只说正规的来源，教导主任和校长是可以随时查看你的文件的，所以大姐姐会被不定时清理掉，严重的甚至冻结删号!

gsuite 授权团队版，这个原卖家可以管理你的账号和所有文件，能免费玩多久不确定，全看卖家货源和良心，好处是一般卖家不会闲的没事干乱搞你的大姐姐，文件可以为所欲为上传，当然，恐怖主义或者儿童色情恐怕不合适!  
最后一点，团队云盘拥有强大的合作（拉好友一起上传大姐姐）共享（小伙伴们一起看，甚至可以做付费后授权拉人自动接口，比微信度娘盘卖资源的高到哪里去了，也安全不少，咳咳），一个盘最大目测是可以 500 人同步作业。

下图为团队云盘界面示例，团队盘可以自定义一个 banner，这个个人比较喜欢，你可以打扮得萌萌哒  
[![](https://omo.moe/usr/uploads/2018/04/gg.png)
](https://omo.moe/usr/uploads/2018/04/gg.png)

[请输入图片描述](https://omo.moe/usr/uploads/2018/04/gg.png)

以及简单明了的团队协作操作，可以方便让小伙伴们被 jc 叔叔一窝端

**# 安装 Rclone**

首先第三方 epel 源还有 fuse 等依赖都先安一遍

```null
yum -y install epel-release
yum -y install wget unzip screen fuse fuse-devel
```

然后安装 rclone

```null
wget https://downloads.rclone.org/rclone-current-linux-amd64.zip
unzip rclone-current-linux-amd64.zip
chmod 0755 ./rclone-*/rclone
cp ./rclone-*/rclone /usr/bin/
rm -rf ./rclone-*
```

安好后运行配置

```null
rclone config
```

[![](https://omo.moe/usr/uploads/2018/04/setup1.png)
](https://omo.moe/usr/uploads/2018/04/setup1.png)

[配置流程 1](https://omo.moe/usr/uploads/2018/04/setup1.png)

[![](https://omo.moe/usr/uploads/2018/04/setup2.png)
](https://omo.moe/usr/uploads/2018/04/setup2.png)

[配置流程 2](https://omo.moe/usr/uploads/2018/04/setup2.png)

Configure this as a Team Drive , 这里填 y  
稍微要注意的，这个授权过程，鼠标全部选择下图那个长长的网址 link，然后右键出菜单复制，到你的电脑浏览器打开，登陆谷歌进行授权，你的电脑浏览器会返回一个授权码，复制后，到 Xshell5 鼠标右键粘贴到：  
Enter verificaition code; 这里，回车，然后这里是选择的作为 Team Drive 访问，所以下图是出现 team drive list（列表）  
如果你用的教育版无限网盘，记得前面选项别选择作为 Team Drive 挂载!

\[![](https://omo.moe/usr/uploads/2018/04/setup.png)

请输入图片描述

]([https://omo.moe/usr/uploads/2018/04/setup.png](https://omo.moe/usr/uploads/2018/04/setup.png))

退出编辑后，本地创一个挂载目录文件夹

```null
mkdir /root/Gdrive
```

**# 挂载**

```null
rclone mount GdriveA:movies /root/Gdrive --allow-other --allow-non-empty --vfs-cache-mode writes &
```

解释一下，rclone mount 你之前填的谷歌团队云盘名字：团队盘里任意存在的目录名 /root/Gdrive 指的是刚才新建的本地挂载目录路径，`--`之后是挂载模式，`&`是后台运行  
`df -h`查看一下  
发现一个 1PB 的 GdriveA 盘，就是成功挂载了  
卸载：

```null
fusermount -qzu LocalFolder
```

此处示例为`fusermount -qzu /root/Gdrive`

之前走了误区，以为拷贝到挂载目录 root/Gdrive 下面，还需要手动 rclone 目录下文件到谷歌云盘，做了一个测试，当然，这样肯定可以的  
[![](https://omo.moe/usr/uploads/2018/04/copy-test.png)
](https://omo.moe/usr/uploads/2018/04/copy-test.png)

[请输入图片描述](https://omo.moe/usr/uploads/2018/04/copy-test.png)

还不懂 ls cd 怎么用的，去看以前的帖子吧，上图是随便找了 root 目录咱们的 transmission 文件包拷贝测试上传，结果很成功，后面实际知道，不需要使用 rclone copy，放进来本地挂载文件夹下就会自动上传到谷歌云盘的  
这边上传完成，浏览器自动就出现了，可以找个大点的资源文件测试了

\[![](https://omo.moe/usr/uploads/2018/04/team-drive.png)

请输入图片描述

]([https://omo.moe/usr/uploads/2018/04/team-drive.png](https://omo.moe/usr/uploads/2018/04/team-drive.png))

随便在我堡选了个 3GB 不到的小种子，稍等 2 分钟下载完毕

\[![](https://omo.moe/usr/uploads/2018/04/test-torrent.png)

请输入图片描述

]([https://omo.moe/usr/uploads/2018/04/test-torrent.png](https://omo.moe/usr/uploads/2018/04/test-torrent.png))

去咱们的杜甫看看已完成文件夹下面是否有了

\[![](https://omo.moe/usr/uploads/2018/04/test-downloads.png)

请输入图片描述

]([https://omo.moe/usr/uploads/2018/04/test-downloads.png](https://omo.moe/usr/uploads/2018/04/test-downloads.png))

很好，紫红色代表是文件，那些绿底蓝字是文件夹。

```null
cp /home/transmission/Downloads/"波牛.The.Champions.1983.1080p.WEB-DL.AAC.H264-OurTV.mp4" /root/Gdrive
```

因为有些人上传的文件或者文件夹不规范，空格啊，乱用字符啊，如果你直接拷贝，可能会出错，删也不好删什么的，所以最好把文件名加半角的双引号，放心点。  
如果出现这种草泥马奔过心头的卡机或者磁盘空间无法释放问题，下面会给出解决方案，所以说格式很重要，各位上传资源真的别太任性了，要不然给咱指令党带来各种坑和不便  
[![](https://omo.moe/usr/uploads/2018/04/upload-gg-done.png)
](https://omo.moe/usr/uploads/2018/04/upload-gg-done.png)

[请输入图片描述](https://omo.moe/usr/uploads/2018/04/upload-gg-done.png)

稍等 2 分钟，根据你的网络上传速度，我这是 30MB/s, 所以不到 3 分钟，Xshell5 上面拷贝上传完毕，浏览器一个同样的文件就出现在咱们的谷歌团队云盘了

稍等 20 分钟，你就可以在线看电影了  
[![](https://omo.moe/usr/uploads/2018/04/%E6%97%A0%E6%A0%87%E9%A2%98.jpg)
](https://omo.moe/usr/uploads/2018/04/%E6%97%A0%E6%A0%87%E9%A2%98.jpg)

[movie](https://omo.moe/usr/uploads/2018/04/%E6%97%A0%E6%A0%87%E9%A2%98.jpg)

至此，一个完整的备份操作完毕，你学会了么？  
一些延展探讨：  
一，上面某人说到的，资源放在谷歌云盘，挂载本地做种，这个大佬们测试过了，是不行的，虽然模式是本地硬盘，真要读取上传，会下载整个文件下来，所以节省不了你的杜甫硬盘空间，谷歌的 api 调用限制，也不够你这样折腾几分钟就会每日上限的，当然你可以挂一堆几 M 的小种子到你的 2，99，3，99 年付小鸡上试试  
二，如何重启后自动挂载，这个个人不推荐，没必要那么没日没夜自动备份，想学的可以看博客里面介绍的，有前辈提供了自动重启挂载脚本  
三，是不是可以直接挂载到 pt 下载已完成的文件夹？比如 /home/transmission/Downloads  
嗯，为了防止 2TB 的文件出现各种同步卡顿意外，我个人选择留点空间拷贝至挂载目录下同步，你要是足够疯狂想自动同步你所有下好的资源，请直接

```null
rclone mount GdriveA:movies /home/transmission/Downloads --allow-other --allow-non-empty --vfs-cache-mode writes
```

务必回来告诉我效果如何，非常感谢！  
四，cp 到挂载目录卡顿，删除文件后磁盘空间没释放的问题，

```null
cp -r /home/transmission/Downloads/Despicable.Me.3.2017.BluRay.Remux.1080p.AVC.DTS-HD.MA.7.1-OurBits /root/Gdrive
```

再执行下拷贝，查看 / root/Gdrive 下面出现对应文件就行

还有其他的，欢迎各位探讨，作为一个纯小白，我的操作只能说达到能用的阶段，如何有更高效精准的操作，希望大佬们不吝赐教!

更新：现在我已经直接用 rclone copy 指令直接从本地传到谷歌盘了

```null
rclone copy -v --stats 15s --bwlimit 40M /home/transmission/Downloads GdriveA:movies/tmp
```

这代表 15s 更新一次进展状态，限速 40MB/s，即 320m/s，可以保证上传的时候，pt 上传质量

常用指令参考：  
[https://liyuans.com/archives/rclone.html](https://liyuans.com/archives/rclone.html)  
文章参考，感谢：  
[https://gaoguangpeng.cn/994.html](https://gaoguangpeng.cn/994.html)  
[https://blog.digac.cc/2018/03/21/mount_google_drive_with_rclone/](https://blog.digac.cc/2018/03/21/mount_google_drive_with_rclone/)  
[https://rclone.org/install/](https://rclone.org/install/)  
[https://moeclub.org/2017/11/28/500/](https://moeclub.org/2017/11/28/500/)  
排名不分先后

本地文件同步示例：

```null
cp -f /home/transmission/Downloads/* /home/transmission/Gdrive
```

如果比较懒，多次上传文件夹下所有内容可以使用`--dry-run`检测具体需要拷贝的文件和结构，删本地文件夹前切记卸载挂的云盘，否则远程云盘文件也会被删除，还原的话，文件夹结构会错乱，非常麻烦！

```null
fusermount -qzu /home/transmission/Gdrive
```

本地文件整理完毕后就可以继续挂载了

```null
rclone mount GdriveA:movies/tmp /home/transmission/Gdrive --allow-other --allow-non-empty --vfs-cache-mode writes
```

然后检测下：

```null
rclone copy --dry-run /home/transmission/Downloads/ GdriveA:movies/tmp
```

确认无误后，再执行下面命令，同时能显示进度，省的大文档搬运等待时间漫漫，可以考虑安装 screen 挂着让它慢慢传：

```null
rclone copy -v --stats 5s  /home/transmission/Downloads/ GdriveA:movies/tmp
```

screen 操作三连：`screen -ls`显示列表 `screen -r 数字名` 连接对应窗口， `screen +a +d` 退出窗口 
 [https://omo.moe/archives/103/](https://omo.moe/archives/103/) 
 [https://omo.moe/archives/103/](https://omo.moe/archives/103/)
