---
title: django 重写 mysql 连接库实现连接池 - leffss - 博客园
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

# [django 重写 mysql 连接库实现连接池](https://www.cnblogs.com/leffss/p/11988183.html)

# django 重写 mysql 连接库实现连接池

### 问题

django 项目使用 gunicorn + gevent 部署，并设置 `CONN_MAX_AGE` 会导致 mysql 数据库连接数飙升，在高并发模式可能会出现 `too many connections` 错误。该怎么解决这个问题呢？首先看下 django 源码，找到问题的根源。

> 本文 django 版本为 2.2.3。

### 问题分析

首先查看连接部分源码：

```python
# django/db/backends/mysql/base.py

class DatabaseWrapper(BaseDatabaseWrapper):
    vendor = 'mysql'
	...
	...
	...
    def get_new_connection(self, conn_params):
	    # 每次查询都会重新建立连接
        return Database.connect(**conn_params)
	...
	...
	...
```

再查看其基类 `BaseDatabaseWrapper`

```python
# django/db/backends/base/base.py

class BaseDatabaseWrapper:
    """Represent a database connection."""
    # Mapping of Field objects to their column types.
    data_types = {}
	...
	...
	...

    def _close(self):
        if self.connection is not None:
            with self.wrap_database_errors:
                # 每次查询完又要调用 close 关闭连接
                return self.connection.close()
	...
	...
	...
```

查看源码发现 django 连接 mysql 时没有使用连接池，导致每次数据库操作都要新建新的连接并查询完后关闭，更坑的是按照 django 的官方文档设置 `CONN_MAX_AGE` 参数是为了复用连接，然后设置了 `CONN_MAX_AGE` 后，每个新连接查询完后并不会 close 掉，而是一直在那占着。

### 问题解决

通过重写 django 官方 mysql 连接库实现连接池解决。

#### `settings.py` 配置

```python

...
DATABASES = {
    'default': {
        'ENGINE': 'db_pool.mysql',     # 重写 mysql 连接库实现连接池
        'NAME': 'devops',
        'USER': 'devops',
        'PASSWORD': 'devops',
        'HOST': '192.168.223.111',
        'PORT': '3306',
        # 'CONN_MAX_AGE': 600,    # 如果使用 db_pool.mysql 绝对不能设置此参数，否则会造成使用连接后不会快速释放到连接池，从而造成连接池阻塞
        # 数据库连接池大小，mysql 总连接数大小为：连接池大小 * 服务进程数
        'DB_POOL_SIZE': 3,     # 默认 5 个
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
         },
    }
}
...
```

#### 目录结构

```python
db_pool/
├── __init__.py
└── mysql
    ├── base.py
    └── __init__.py
```

-   db_pool 位于 django 项目根目录

#### base.py

```python
# -*- coding: utf-8 -*-
from django.core.exceptions import ImproperlyConfigured
import queue
import threading

try:
    import MySQLdb as Database
except ImportError as err:
    raise ImproperlyConfigured(
        'Error loading MySQLdb module.\n'
        'Did you install mysqlclient?'
    ) from err

from django.db.backends.mysql.base import *
from django.db.backends.mysql.base import DatabaseWrapper as _DatabaseWrapper

DEFAULT_DB_POOL_SIZE = 5


class DatabaseWrapper(_DatabaseWrapper):
    """
    使用此库时绝对不能设置 CONN_MAX_AGE 连接参数，否则会造成使用连接后不会快速释放到连接池，从而造成连接池阻塞
    """
    connect_pools = {}
    pool_size = None
    mutex = threading.Lock()

    def get_new_connection(self, conn_params):
        with self.mutex:
            # 获取 DATABASES 配置字典中的 DB_POOL_SIZE 参数
            if not self.pool_size:
                self.pool_size = self.settings_dict.get('DB_POOL_SIZE') or DEFAULT_DB_POOL_SIZE
            if self.alias not in self.connect_pools:
                self.connect_pools[self.alias] = ConnectPool(conn_params, self.pool_size)
            return self.connect_pools[self.alias].get_connection()

    def _close(self):
        with self.mutex:
            # 覆盖掉原来的 close 方法，查询结束后连接释放回连接池
            if self.connection is not None:
                with self.wrap_database_errors:
                    return self.connect_pools[self.alias].release_connection(self.connection)


class ConnectPool(object):
    def __init__(self, conn_params, pool_size):
        self.conn_params = conn_params
        self.pool_size = pool_size
        self.count = 0
        self.connects = queue.Queue()

    def get_connection(self):
        if self.count < self.pool_size:
            self.count = self.count + 1
            return Database.connect(**self.conn_params)
        conn = self.connects.get()
        try:
            # 检测连接是否有效，去掉性能更好，但建议保留
            conn.ping()
        except Exception:
            conn = Database.connect(**self.conn_params)
        return conn

    def release_connection(self, conn):
        self.connects.put(conn)

```

### 总结

利用连接池解决过高连接数的问题。

评论

   [回复](javascript:void(0);) [引用](javascript:void(0);)

[#1 楼](#4589607) 2020-05-28 17:37 | [wangchenxi](https://www.cnblogs.com/wongchenxi/)

```python
def get_connection(self):
        if len(self.connects) < self.pool_size:
            new_connect = Database.connect(**self.conn_params)
            self.connects.append(new_connect)
            return new_connect
        index = random.randint(0, self.pool_size - 1)   # 随机返回连接池中的连接
        try:
            # 检测连接是否有效，去掉性能更好，但建议保留
            self.connects[index].ping()
        except Exception:
            self.connects[index] = Database.connect(**self.conn_params)
        return self.connects[index]
```

你的获取连接，是不安全。会出现多个调用同时使用同一个连接，进而导致数据安全出问题。这个地方的逻辑应该是：先检查已经存在的连接个数，如果为 0，则创建连接，如果不为零，则检查是否存在可以使用的空闲连接，存在则返回，不存在空闲连接，则检查存在连接个数，如果小于最大连接数，则创建并返回连接，如果相等，则悬停等待获取下一个释放连接。

[支持 (0)](javascript:void(0);) [反对 (0)](javascript:void(0);)

   [回复](javascript:void(0);) [引用](javascript:void(0);)

[#2 楼](#4630050) \[楼主] 2020-07-13 15:14 | [leffss](https://www.cnblogs.com/leffss/)

[@](#4589607 "查看所回复的评论")wangchenxi  
的确是的，感谢提醒，会研究一下正确的写法的

[支持 (0)](javascript:void(0);) [反对 (0)](javascript:void(0);)

   [回复](javascript:void(0);) [引用](javascript:void(0);)

[#3 楼](#4630218) \[楼主] 2020-07-13 17:20 | [leffss](https://www.cnblogs.com/leffss/)

[@](#4589607 "查看所回复的评论")wangchenxi  
已经重构了，由于个人精力问题，只做了简单测试，暂时没有发现问题，欢迎指正

[支持 (0)](javascript:void(0);) [反对 (0)](javascript:void(0);)

   [回复](javascript:void(0);) [引用](javascript:void(0);)

[#4 楼](#4630255) 4630255 2020/7/13 下午 5:38:39 2020-07-13 17:38 | [wangchenxi](https://www.cnblogs.com/wongchenxi/)

[@](#4630218 "查看所回复的评论")leffss  
我前一段时间需要解决一个数据库连接的问题，所以找到了你的博客。后来我又查找了其他的博客，最后解决了问题。下面的连接就是我根据查找到的博客，总结的问题解决博客。  
[https://wangchenxi.top/blog/87/](https://wangchenxi.top/blog/87/)

其实，对于这类问题，我们要做的是，了解原理，除非有很苛刻的生产环境需要定制需求，否则一般基本不用我们自己去实现。因为，如果我们自己去实现，往往会受限于个人阅历局限，进而导致新的问题。一般都是我们吃透了一个框架或者标准库里面的通用实现，对通用的解决方案有了比较全面的理解，同时也发现通用的解决方案存在的问题，这个时候才需要我们自己去梳理、实现。

大家往往的情况是，不知道有解决自己遇见问题的通用方案，而导致重复造轮子。所以，能提出问题才是显得尤为重要。其实，用” 行话 “提出问题，并找到答案是不难的。但是，关键是熟悉 “行话”，也就是 “术语”。 啰嗦了那么多，哈哈，算是自己的总结，也算是与你分享一下我的看法。祝好。

 [https://www.cnblogs.com/leffss/p/11988183.html](https://www.cnblogs.com/leffss/p/11988183.html) 
 [https://www.cnblogs.com/leffss/p/11988183.html](https://www.cnblogs.com/leffss/p/11988183.html)
