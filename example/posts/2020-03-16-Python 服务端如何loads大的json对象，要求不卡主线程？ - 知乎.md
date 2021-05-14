---
title: Python 服务端如何loads大的json对象，要求不卡主线程？ - 知乎
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

ok，昨天就看到了这个问题，我想问下，json 大概有多大呢，具体的结构是个什么样的呢，楼主没有说清楚哦，json 需要多线程取解决？

对于大型的 json 可以使用 ijson 这样的模块，将 json 当作流而不是块来处理。

[ijson​pypi.org![](https://pic1.zhimg.com/v2-a9769da02536e85b74b5c7edf64a37b4_ipico.jpg)
](https://link.zhihu.com/?target=https%3A//pypi.org/project/ijson/)

ok，以上是对楼主的解答，下面我扩展的说一个相关的问题

* * *

由于工作需求，需要一个更加灵活的字典形式，具备字典的哈希特性，而且在创建 nest 的时候，更加灵活，通过 stackoverflow 上的一个问答，具体搬运如下：

```python
class AutoVivification(dict):
    """Implementation of perl's autovivification feature.
    """
    def __getitem__(self, item):
        try:
            return dict.__getitem__(self, item)
        except KeyError:
            value = self[item] = type(self)()
            return value

a = AutoVivification()

a[1][2][3] = 4
a[1][3][3] = 5
a[1][2]['test'] = 6

print a

output
{1: {2: {'test': 6, 3: 4}, 3: {3: 5}}}
```

 [https://www.zhihu.com/question/332231514/answer/732632411](https://www.zhihu.com/question/332231514/answer/732632411)
