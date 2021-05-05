---
title: 【tornado】write和finish区别
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

<a name="964Q5"></a>
## 1. 代码演示
```python
from tornado_learning.handler import BaseHandler
import time

class Write_Finish_Handler(BaseHandler):

    def get(self):
        self.write("hello")
        time.sleep(4)
        self.finish("world")
```
```python
"""
四秒后输出hello world
"""
```
```python
class Finish_Write_Handler(BaseHandler):

    def get(self):
        self.finish("hello")
        self.write("world")
```
```python
"""
仅输出hello
同时报错：
	RuntimeError: Cannot write() after finish()
报错不影响前端显示和其他操作
"""
```
<a name="syXw2"></a>
## 2. 解释

- `self.finish()`代表回应到前端的终结。并且可以在`finsh`后做一些与回应给前端无关的操作，缩短响应时间。
- `self.write()`并不会马上将数据返回前端，必须在`self.finsh()`或者`return`后才会响应，类似以缓存吧。

<br />
> self.finish() 代表回应生成的终结，并不代表着请求处理逻辑的终结。假设你有一个block的逻辑是和回应无关的，那么放在self.finish() 的后面可以显著的缩短响应时间。所以，如果你确定自己的逻辑需要立即返回，可以在self.finish()后立刻return。Tornado在将这个自由留给了你自己。



