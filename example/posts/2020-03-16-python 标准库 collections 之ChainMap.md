---
title: python 标准库 collections 之ChainMap
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

ChainMap 非常强大的dict字典组合功能，他将多个dict字典放入到一个list中，他比dict字典使用update快很多。通过ChainMap可以来模拟嵌套的情景，而且多用于模板之中。<br />基本用法，请看下面示例：
```
from collections import ChainMap
m1 = {'Type': 'admin', 'codeID': '00001'}
m2 = {'name': 'woodname','codeID': '00002'}
m = ChainMap(m1, m2)
print(m)
# 输出：
# ChainMap({'Type': 'admin', 'codeID': '00001'}, {'name': 'woodname', 'codeID': '00002'})
print(m.maps)
# 输出：[{'Type': 'admin', 'codeID': '00001'}, {'name': 'woodname', 'codeID': '00002'}]
for i in m.items():
    print(i)
# 输出：
# ('name', 'woodname')
# ('codeID', '00001')
# ('Type', 'admin')
print(m['name']) # 读取元素的值
print(m['codeID']) # 注意，当key重复时以最前一个为准
print(m.get('Type'))
# 输出：
# woodname
# 00001
# admin
# 新增map
m3 = {'data': '888'}
m=m.new_child(m3) # 将 m3 加入m
print(m)
# 输出：
# ChainMap({'data': '888'}, {'Type': 'admin', 'codeID': '00001'}, {'name': 'woodname', 'codeID': '00002'})
print(m.parents) # m 的父亲
# 输出：ChainMap({'Type': 'admin', 'codeID': '00001'}, {'name': 'woodname', 'codeID': '00002'})
print(m.parents.parents)
# 输出 ： ChainMap({'name': 'woodname', 'codeID': '00002'})
```


<a name="mQ4qT"></a>
## **python 标准库 其他文章传送门**
<a name="PFbXV"></a>
## [木头人：python 标准库 collections 之deque](https://zhuanlan.zhihu.com/p/46462831)
<a name="pxQvt"></a>
## [python 标准库 collections 之defaultdict](https://zhuanlan.zhihu.com/p/46476348)
<a name="5lHlO"></a>
## [木头人：python 标准库 collections 之OrderedDict](https://zhuanlan.zhihu.com/p/46497740)
<a name="oLrrl"></a>
## [python 标准库 collections 之namedtuple](https://zhuanlan.zhihu.com/p/46187444)
<a name="tgQjP"></a>
## [python 标准库 collections 之Counter](https://zhuanlan.zhihu.com/p/46509440)
<a name="2hYIm"></a>
## [python 标准库 collections 之ChainMap](https://zhuanlan.zhihu.com/p/48032365)
