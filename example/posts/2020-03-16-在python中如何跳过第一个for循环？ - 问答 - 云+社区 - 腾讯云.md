---
title: 在python中如何跳过第一个for循环？ - 问答 - 云+社区 - 腾讯云
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

## 在 python 中如何跳过第一个 for 循环？

在 python 中，我如何做这样的事情：

    for car in cars:
       # Skip first and last, do work for rest

提问于 2018-02-062018-02-06 01:21:44

用户回答回答于 2018-02-062018-02-06 10:16:59

对于任何可迭代项，跳过第一项：

    itercars \= iter(cars)
    next(itercars)
    for car in itercars:
        # do work

如果您想跳过最后一步，您可以：

    itercars \= iter(cars)
    # add 'next(itercars)' here if you also want to skip the first
    prev \= next(itercars)
    for car in itercars:
        # do work on 'prev' not 'car'
        # at end of loop:
        prev \= car
    # now you can do whatever you want to do to the last one on 'prev'

 [https://cloud.tencent.com/developer/ask/42951](https://cloud.tencent.com/developer/ask/42951) 
 [https://cloud.tencent.com/developer/ask/42951](https://cloud.tencent.com/developer/ask/42951)
