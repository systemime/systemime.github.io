---
title: 【django】models在admin中注册
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



```python
# admin.py
from APP_NAME import models

# 自定义显示字段
class PermissionAdmin(admin.Models.Admin):
    list_dispaly = ['id', 'xxx', 'xxx']

admin.size.register(modles.User)
```


