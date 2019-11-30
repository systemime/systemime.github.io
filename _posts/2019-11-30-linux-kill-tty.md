---
layout: post
title: 'Linux杀死其他tty终端'
subtitle: 'linux中如何杀死其他tty终端的方法'
date: 2019-11-30 00:30:00
author: qifeng
color: rgb(243,106,9)
cover: 'https://raw.githubusercontent.com/systemime/my_image/master/tty.png'
tags: linux tty
---
## Linux杀死tty终端进程  

#### 用 `ps -t` 命令可以得到终端的进程号  

```
$ ps -t tty1

PID TTY TIME CMD

31419 tty1 00:00:00 bash
```  


#### 用 `kill -9` 命令可以将进程杀掉，以关闭终端  

```
$ kill -9 31419
```

