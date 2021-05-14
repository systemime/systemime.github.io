---
title: Tornado @tornado.gen.coroutine 与 yield - Jay54520 - 博客园
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

在使用 Tornado 的过程中产生了以下疑问：

-   什么时候需要给函数增加 `@tornado.gen.coroutine`
-   什么时候调用函数需要 `yield`

## `@tornado.gen.coroutine` 与 `yield` 是如何工作的

包含 `yield` 的函数是一个 generator\[1]。`@gen.coroutine` 通过 `yield` 与 generator 沟通、通过返回 `Future` 与协程的调用者沟通。

具体沟通情况：

-   `@gen.coroutine` 收到从 generator 返回的 `Future`
-   "unwraps" `Future` 获得结果
-   将结果发送回 generator 以作为 `yield` 表达式的结果

## 如何调用协程

上文提到，

> `@gen.coroutine` 通过返回 `Future` 与协程的调用者沟通

所以我们必须 "unwraps" 这个 `Future` 才能得到结果。

所以在绝大部分情况下，任何调用协程的函数本身必须是一个协程，并且在调用中要使用 `yield`。

```python
@gen.coroutine
def good_call():
    
    
    yield divide(1, 0)
```

注意，`yield` 只有在 `@gen.coroutine` 中才会 "unwraps" 一个 `Future`，如果没有 `@gen.coroutine`，那么 `yield` 只会将该函数变为一个而普通的生成器，比如下面两个例子。

-   错误的

```python
import tornado.gen
from tornado.ioloop import IOLoop
from tornado.gen import Return


@tornado.gen.coroutine
def call_me():
    raise Return('result')


def f():
    r = yield call_me()
    print(r)  


IOLoop.current().run_sync(f)
```

错误的原因是：`run_sync` 会调用 `f()`，然后尝试将 `f()` 的结果转换为 `Future`，转换的函数如下：

```python

def convert_yielded(yielded):
    """Convert a yielded object into a `.Future`.

    The default implementation accepts lists, dictionaries, and Futures.

    If the `~functools.singledispatch` library is available, this function
    may be extended to support additional types. For example::

        @convert_yielded.register(asyncio.Future)
        def _(asyncio_future):
            return tornado.platform.asyncio.to_tornado_future(asyncio_future)

    .. versionadded:: 4.1
    """
    
    if yielded is None:
        return moment
    elif isinstance(yielded, (list, dict)):
        return multi(yielded)
    elif is_future(yielded):
        return yielded
    elif isawaitable(yielded):
        return _wrap_awaitable(yielded)
    else:
        raise BadYieldError("yielded unknown object %r" % (yielded,))
```

由于 `f()` 返回的是一个 `generator` 对象，不符合转换的要求，所以报错。如果给 `f()` 加上 `@tornado.gen.coroutine`，那么装饰器会将 `f()` 返回的结果转换为 `Future`，符合 `elif is_future(yielded):`，也就能顺利运行。

-   正确的

```python
import tornado.gen
from tornado.ioloop import IOLoop
from tornado.gen import Return


@tornado.gen.coroutine
def call_me():
    raise Return('result')


@tornado.gen.coroutine
def f():
    r = yield call_me()
    print(r)  


IOLoop.current().run_sync(f)
```

## 总结

-   当调用一个协程时，`@tornado.gen.coroutine` 与 `yield` 必须同时出现调用函数中
-   如果只是在协程中执行操作或者直接返回结果，有 `@tornado.gen.coroutine` 和 return（raise Return）就够了

## 参考

1.  [https://docs.python.org/2.4/ref/yield.html](https://docs.python.org/2.4/ref/yield.html)
2.  [http://www.tornadoweb.org/en/stable/guide/coroutines.html#how-it-works](http://www.tornadoweb.org/en/stable/guide/coroutines.html#how-it-works) 
    [https://www.cnblogs.com/jay54520/p/9118621.html](https://www.cnblogs.com/jay54520/p/9118621.html) 
    [https://www.cnblogs.com/jay54520/p/9118621.html](https://www.cnblogs.com/jay54520/p/9118621.html)
