---
title: git reset —hard后暂存区代码跑哪儿去了？
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

---

转自：[https://www.licoy.cn/3508.html](https://www.licoy.cn/3508.html)

---

<a name="Z71KW"></a>
## 前言
昨天博主在临近下班之时，准备提交代码到远程Git，当我Pull远程代码的时候提示我有冲突，主要是resource目录下的文件被删除的更新，奈何IDEA又不给我个合并的界面，只告诉我这几个文件需要合并~[![](https://cdn.nlark.com/yuque/0/2020/jpeg/663138/1595078274968-8dc3f25c-3a6d-4092-8cbd-828dff23d84f.jpeg#align=left&display=inline&height=383&margin=%5Bobject%20Object%5D&originHeight=383&originWidth=900&size=0&status=done&style=none&width=900)](https://www.licoy.cn/wp-content/uploads/2020/06/gitresethard.jpg)于是我脑袋一热就回滚到有需要合并的那个commit版本，然后就fuck，我暂存区的代码全部“game over！”不见了。

<a name="TMmlK"></a>
## 解决方案
发现代码不见了顿时就像第一次见了喜欢的姑娘，心里那是一波又一波的小鹿乱撞，不过这是悲伤的。<br />于是乎就在网上急切的寻找办法，终于在我一顿操作猛如虎的搜索下，最终将代码恢复了。<br />在仓库的目录下打开终端，输入：
> find .git/objects -type f | xargs ls -lt | sed 60q


<br />其中末尾的`60q`代表最近60次的add操作，然后会出来很多类似于这样的记录：
```
-r--r--r--  1 licoy  staff      249 Jun 17 17:59 .git/objects/c0/dd72f08b16a4f9c1d87b836b7ecee75a332252
-r--r--r--  1 licoy  staff       45 Jun 17 17:59 .git/objects/58/c50797f9fe9dceda109019a2b8d9cf18a48df4
-r--r--r--  1 licoy  staff       46 Jun 17 17:59 .git/objects/9c/9c6c686a21fc394d8dfc550f41824205b1dffa
-r--r--r--  1 licoy  staff      750 Jun 17 17:59 .git/objects/d7/73c7e375a316fe3e00800ffd5c5be49b00fba3
-r--r--r--  1 licoy  staff     1217 Jun 17 17:59 .git/objects/6b/a44cf7a71f83f06d969af0a2464451edc133bb
-r--r--r--  1 licoy  staff    29067 Jun 17 17:57 .git/objects/1a/56f322c6cbe07642ca248cc8de3a63d5acd0d7
-r--r--r--  1 licoy  staff      200 Jun 17 17:55 .git/objects/30/3d28198f9375111092438ddb7d872aca84f863
-r--r--r--  1 licoy  staff       79 Jun 17 17:55 .git/objects/ab/0c251513237d54b9c439e73a2f26486432ed3d
-r--r--r--  1 licoy  staff      234 Jun 17 17:55 .git/objects/e4/57508e691703f4ff58a69f3410cd28f3780d63
-r--r--r--  1 licoy  staff       45 Jun 17 17:55 .git/objects/67/948e2e1cb35a82799585b64859d8473b01dbe7
-r--r--r--  1 licoy  staff       47 Jun 17 17:55 .git/objects/f5/4b5612be0810f4658c15a9a2297ac34198c7e0
-r--r--r--  1 licoy  staff      250 Jun 17 17:39 .git/objects/1a/908f631cfe95ab0979877f929280992bacc009
```

<br />然后我们选择差不多最近的时间记录，然后找到他的文件路径在终端输入
```
git cat-file -p {commit_id} > c.txt
```


其中`{commit_id}`是`.git/objects/ab/0c251513237d54b9c439e73a2f26486432ed3d`部分中的`ab/0c251513237d54b9c439e73a2f26486432ed3d`，要去掉中间的斜杠，然后就是一次`commit_id`。<br />
<br />
<br />执行上述命令之后会将`commit_id`主要内容输出到`c.txt`，然后我们需要人工辨别记录内容是不是我们暂存区的内容，如果是，那我们只需要在回滚到这个`commit_id`版本即可。<br />

<a name="Z24s9"></a>
## 尾记
这次的操作之后让我对每次的回滚更加小心翼翼了，说白了还是对Git不是那么透彻，`git reset --hard`要慎用，用不好就像用了`rm -rf xxx`一样，后悔莫及哟~
