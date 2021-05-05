---
title: celery异步,延时任务, 周期任务 - robertx - 博客园
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

　　celery 中文译为芹菜, 是一个分布式任务队列. 是异步的, 所以能处理大量消息

　　最新的 celery 不支持 windows 下使用了, 所以在使用 pycharm 安装 celery 模块之后, 需要再安装 eventlet 模块才能测试运行.

启动客户端:

s1,s2 要在项目目录下, 如果在文件夹中执行, terminal 输入命令的时候要 - A 项目文件夹的名字

c=Celery("task",broker="redis://127.0.0.1:6379/2",backend="redis://127.0.0.1:6379/1", include="项目名. 文件夹")

Terminal 中输入

celery worker -A s1 -l info -P eventlet

　　给定两个文件

　　s1.py

![](https://common.cnblogs.com/images/copycode.gif)

from celery import Celery import time
c\\=Celery("task",broker="redis://127.0.0.1:6379/2",backend="redis://127.0.0.1:6379/1")

@c.task def myfun1(a,b): return f"myfun1{a}{b}" @c.task def myfun2(): return "myfun2" @c.task def myfun3(): return "myfun3" celery worker -A s1 -l info -P eventlet

![](https://common.cnblogs.com/images/copycode.gif)

　　s2.py

![](https://common.cnblogs.com/images/copycode.gif)

from s1 import myfun1,myfun2,myfun3,c from celery.result import AsyncResult #多个生产者 # for i in range(10): # s=myfun1.delay() # print(s)
 s\\=myfun1.delay(10,20) print(s.id)
r\\=AsyncResult(id=s.id,app=c) #获取状态 # print(r.status) # print(r.successful())

\#获取值 # print(r.get())

\#只获取报错信息
print(r.get(propagate=False)) #获取具体出错的位置 # print(r.traceback)

![](https://common.cnblogs.com/images/copycode.gif)

### 　　apply_async

t=add.apply_async((1,2),countdown=5) #表示延迟 5 秒钟执行任务
print(t) print(t.get())

　　支持的参数

![](https://common.cnblogs.com/images/copycode.gif)

countdown : 等待一段时间再执行.
add.apply_async((2,3), countdown=5)  
eta : 定义任务的开始时间. 这里的时间是 UTC 时间, 这里有坑
add.apply_async((2,3), eta=now+tiedelta(second=10))  
expires : 设置超时时间.
add.apply_async((2,3), expires=60)  
retry : 定时如果任务失败后, 是否重试.
add.apply_async((2,3), retry=False)  
retry_policy : 重试策略.
　　max_retries : 最大重试次数, 默认为 3 次.
　　interval_start : 重试等待的时间间隔秒数, 默认为 0 , 表示直接重试不等待.
　　interval_step : 每次重试让重试间隔增加的秒数, 可以是数字或浮点数, 默认为 0.2 interval_max : 重试间隔最大的秒数, 即 通过 interval_step 增大到多少秒之后, 就不在增加了, 可以是数字或者浮点数, 默认为 0.2 .

![](https://common.cnblogs.com/images/copycode.gif)

　　s1.py

![](https://common.cnblogs.com/images/copycode.gif)

from celery import Celery import time
c\\=Celery("task",broker="redis://127.0.0.1:6379/2",backend="redis://127.0.0.1:6379/1")

@c.task def myfun1(a,b): return f"myfun1{a}{b}" @c.task def myfun2(): return "myfun2" @c.task def myfun3(): return "myfun3"

![](https://common.cnblogs.com/images/copycode.gif)

　　s2.py

![](https://common.cnblogs.com/images/copycode.gif)

from s1 import myfun1,myfun2,myfun3,c from celery.result import AsyncResult from datetime import timedelta #指定多长时间以后执行 # s=myfun1.apply_async((10,20),countdown=5)

\#第二种方式，使用 utc 时间
s=myfun1.apply_async((10,20),eta="utc 时间") print(s.id) # 延时 # 重试

![](https://common.cnblogs.com/images/copycode.gif)

　　启动: 在 Terminal 中

celery beat -A s2 -l info

　　s1.py

![](https://common.cnblogs.com/images/copycode.gif)

from celery import Celery import time
c\\=Celery("task",broker="redis://127.0.0.1:6379/2",backend="redis://127.0.0.1:6379/1")

@c.task def myfun1(a,b): return f"myfun1{a}{b}" @c.task def myfun2(): return "myfun2" @c.task def myfun3(): return "myfun3"

![](https://common.cnblogs.com/images/copycode.gif)

　　s2.py

![](https://common.cnblogs.com/images/copycode.gif)

from s1 import c from celery.beat import crontab
c.conf.beat_schedule \\= {"name": { "task": "s1.myfun1", "schedule": 3, "args": (10, 20)
    }, "crontab": { "task": "s1.myfun1", "schedule": crontab(minute=44), "args": (10, 20)
    }
}

![](https://common.cnblogs.com/images/copycode.gif)

 配置详解:

![](https://common.cnblogs.com/images/copycode.gif)

 from celery.schedules import crontab

 CELERYBEAT_SCHEDULE \\= { # Executes every Monday morning at 7:30 A.M
     'add-every-monday-morning': { 'task': 'tasks.add', 'schedule': crontab(hour=7, minute=30, day_of_week=1), 'args': (16, 16),
    },
 }

![](https://common.cnblogs.com/images/copycode.gif) 
 [https://www.cnblogs.com/robertx/p/10841129.html](https://www.cnblogs.com/robertx/p/10841129.html) 
 [https://www.cnblogs.com/robertx/p/10841129.html](https://www.cnblogs.com/robertx/p/10841129.html)
