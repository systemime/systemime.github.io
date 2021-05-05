---
title: 获取1PB谷歌团队盘，并通过rclone挂载到vps|王彬的博客
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

## 获取 1PB 谷歌团队盘，并通过 rclone 挂载到 vps

## 一. 简介

[https://github.com/donwa/goindex](https://github.com/donwa/goindex)

前段时间 goindex 很火，用来搭建 Google Drive 目录索引网盘。

今天有时间正好折腾下，领取个谷歌 1PB 团队盘然后挂载到 vps 先。

## 二. 领取 1PB 团队盘

谷歌网盘免费空间是 15GB，不过有人分享开团队盘，有 1PB 的空间，理论上是无限容量。

[https://gdrive.zppcw.cn/](https://gdrive.zppcw.cn/)

这个大佬分享的团队盘，域为英国老牌名校谢菲尔德大学。

打开链接后，输入

1.  你想要的团队盘名称，例如：siyou325
2.  gmail 邮箱，例如: xxx@gmail.com

等一会就成功了

具体原理应该是 G Suite 全局管理员创建了团队盘，然后拉你进来自己退出，不过你的数据应该还是会被看到的，先不放私人数据试试吧。

存储公共数据也不错，希望靠谱

## 三. 安装 rclone

Centos7 安装很简单

install_rclone.sh

````null
# 安装依赖
yum -y install wget unzip screen fuse fuse-devel
# 安装rclone
yum -y install  rclone```

四. 配置rclone
-----------

配置比较复杂一些，首先执行配置命令

```null
[root@9s9s-he-sjc ~]# rclone config
2019/11/24 10:09:06 NOTICE: Config file "/root/.config/rclone/rclone.conf" not found - using defaults
No remotes found - make a new one
n) New remote
s) Set configuration password
q) Quit config
n/s/q> n
name> remote```

输入n，remote。创建新的remote，名称是remote

```null
Type of storage to configure.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / A stackable unification remote, which can appear to merge the contents of several remotes
   \ "union"
 2 / Alias for a existing remote
   \ "alias"
 3 / Amazon Drive
   \ "amazon cloud drive"
 4 / Amazon S3 Compliant Storage Provider (AWS, Alibaba, Ceph, Digital Ocean, Dreamhost, IBM COS, Minio, etc)
   \ "s3"
 5 / Backblaze B2
   \ "b2"
 6 / Box
   \ "box"
 7 / Cache a remote
   \ "cache"
 8 / Dropbox
   \ "dropbox"
 9 / Encrypt/Decrypt a remote
   \ "crypt"
10 / FTP Connection
   \ "ftp"
11 / Google Cloud Storage (this is not Google Drive)
   \ "google cloud storage"
12 / Google Drive
   \ "drive"
13 / Hubic
   \ "hubic"
14 / JottaCloud
   \ "jottacloud"
15 / Koofr
   \ "koofr"
16 / Local Disk
   \ "local"
17 / Mega
   \ "mega"
18 / Microsoft Azure Blob Storage
   \ "azureblob"
19 / Microsoft OneDrive
   \ "onedrive"
20 / OpenDrive
   \ "opendrive"
21 / Openstack Swift (Rackspace Cloud Files, Memset Memstore, OVH)
   \ "swift"
22 / Pcloud
   \ "pcloud"
23 / QingCloud Object Storage
   \ "qingstor"
24 / SSH/SFTP Connection
   \ "sftp"
25 / Webdav
   \ "webdav"
26 / Yandex Disk
   \ "yandex"
27 / http Connection
   \ "http"
Storage> 12```

输入12。选择Google Drive

```null
** See help for drive backend at: https://rclone.org/drive/ **

Google Application Client Id
Setting your own is recommended.
See https://rclone.org/drive/#making-your-own-client-id for how to create your own.
If you leave this blank, it will use an internal key which is low performance.
Enter a string value. Press Enter for the default ("").
client_id> ```

输入空，直接回车。使用rclone的client\_id调用google api，这个client\_id用的人肯定比较多，用的太多会被限制，不过先用着吧，后面可以根据https://rclone.org/drive/#making-your-own-client-id创建自己的client\_id

```null
Google Application Client Secret
Setting your own is recommended.
Enter a string value. Press Enter for the default ("").
client_secret> 
描述:输入空，直接回车。使用rclone的client_secret，和上面的一样

Scope that rclone should use when requesting access from drive.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / Full access all files, excluding Application Data Folder.
   \ "drive"
 2 / Read-only access to file metadata and file contents.
   \ "drive.readonly"
   / Access to files created by rclone only.
 3 | These are visible in the drive website.
   | File authorization is revoked when the user deauthorizes the app.
   \ "drive.file"
   / Allows read and write access to the Application Data folder.
 4 | This is not visible in the drive website.
   \ "drive.appfolder"
   / Allows read-only access to file metadata but
 5 | does not allow any access to read or download file content.
   \ "drive.metadata.readonly"
scope> 1```

输入1。有最大的使用权限。

```null
ID of the root folder
Leave blank normally.
Fill in to access "Computers" folders. (see docs).
Enter a string value. Press Enter for the default ("").
root_folder_id> ```

输入空，直接回车。空是跟路径，如果想用别的根路径，到google网盘页面打开那个文件夹，上面的链接是https://drive.google.com/drive/folders/1E8NDZ9OTGSM72eP0kiPG0gQoZ0RzOtyV，这儿输入最后的那部分就好了，1E8NDZ9OTGSM72eP0kiPG0gQoZ0RzOtyV。

```null
Service Account Credentials JSON file path 
Leave blank normally.
Needed only if you want use SA instead of interactive login.
Enter a string value. Press Enter for the default ("").
service_account_file> 
Edit advanced config? (y/n)
y) Yes
n) No
y/n> n```

输入n。不用别的高级配置。

```null
Remote config
Use auto config?
 * Say Y if not sure
 * Say N if you are working on a remote or headless machine
y) Yes
n) No
y/n> n```

输入n。因为我们是vps操作，不能auto config。

```null
If your browser doesn't open automatically go to the following link: https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=202264815644.apps.googleusercontent.com&redirect_uri=urn%3Aietf%3Awg%3Aoauth%3A2.0%3Aoob&response_type=code&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive&state=e0bb55f32e81360bc1d383ec5bbc08cc
Log in and authorize rclone for access
Enter verification code> 4/tgEm4WM9FWvI4yZjiwLvw-52zlCpVZGx7AQBLCdGLI_Er7-NuempcXM```

输入authcode。打开上面的链接授权访问，最后会获取authcode，像4/tgEm4WM9FWvI4yZjiwLvw-52zlCpVZGx7AQBLCdGLI\_Er7-NuempcXM。

```null
Configure this as a team drive?
y) Yes
n) No
y/n> y```

输入y。因为我们之前领取了团队盘

```null
Fetching team drive list...
Choose a number from below, or type in your own value
 1 / siyou325
   \ "0AFyEOkup0ciMUk9PVA"
Enter a Team Drive ID> 1```

输入1.选择我们的团队盘。

```null
--------------------
[remote]
type = drive
scope = drive
token = {"access_token":"ya29.Il-yB6QCh3vuBT9AyGwo69FLusoNzQBTYfR15HFtrPIlY38U4DNYkxPd7wmbbGInRM3Uwj2sN0OvIO0hjrX32tZuIScFpp_N4MKt1zeG8jj-dY2zCBrpqhe2LPB9GiEcPA","token_type":"Bearer","refresh_token":"1//06y1obaMxj9XNCgYIARAAGAYSNwF-L9IrPLszAaTSCd5WDRLSBO3ohK6xl8xkJwHuSmI_r4KLeaopjXscdaJkRl9ZlbURLfenSSs","expiry":"2019-11-24T11:10:48.072564672+08:00"}
team_drive = 0AFyEOkup0ciMUk9PVA
--------------------
y) Yes this is OK
e) Edit this remote
d) Delete this remote
y/e/d> y```

输入y。配置好了

```null
Current remotes:

Name                 Type
====                 ====
remote               drive

e) Edit existing remote
n) New remote
d) Delete remote
r) Rename remote
c) Copy remote
s) Set configuration password
q) Quit config
输入:
e/n/d/r/c/s/q> q```

输入q。退出配置

设置好的配置会保存在/root/.config/rclone/rclone.conf

五. 挂载gdrive
-----------

配置好，后面就好操作了

挂载网盘下的files目录到本地/vps/hosts/gdrive，执行下面命令就好饿了

```null
mkdir -p /vps/hosts/gdrive
rclone mount remote:files /vps/hosts/gdrive --allow-other --allow-non-empty --vfs-cache-mode writes```

六. 其他命令
-------

列出网盘上根目录下的文件

```null
rclone ls remote:```

列出网盘上根目录下的文件夹

```null
rclone lsd remote:```

拷贝本地文件到网盘

```null
rclone copy /home/source remote:backup```

七. 总结
-----

上传了几G文件到网盘，感觉至少有1M每秒的上传速度，还可以

本来还想着要个大盘鸡的，现在有个1PB的网盘挂载到vps，后面看看效果，可能真不需要买了呢

参考：

1.  [https://rclone.org/drive/](https://rclone.org/drive/)
    
2.  [https://blog.csdn.net/deng\_xj/article/details/88576678](https://blog.csdn.net/deng_xj/article/details/88576678) 
 [https://wangbin.io/blog/it/gdrive-rclone.html](https://wangbin.io/blog/it/gdrive-rclone.html) 
 [https://wangbin.io/blog/it/gdrive-rclone.html](https://wangbin.io/blog/it/gdrive-rclone.html)
````
