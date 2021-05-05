---
title: async with和async for_flyingzhao-CSDN博客
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

本文翻译自 Python 的开发者指南[PEP 492](https://www.python.org/dev/peps/pep-0492/#asynchronous-context-managers-and-async-with)。

* * *

网上 async with 和 async for 的中文资料比较少，我把 PEP 492 中的官方陈述翻译一下。

## 异步上下文管理器”async with”

异步上下文管理器指的是在`enter`和`exit`方法处能够暂停执行的上下文管理器。

为了实现这样的功能，需要加入两个新的方法：`__aenter__` 和`__aexit__`。这两个方法都要返回一个 awaitable 类型的值。

异步上下文管理器的一种使用方法是:

```null
class AsyncContextManager:
    async def __aenter__(self):
        await log('entering context')

    async def __aexit__(self, exc_type, exc, tb):
        await log('exiting context')
```

### 新语法

异步上下文管理器使用一种新的语法:

````null
async with EXPR as VAR:
    BLOCK```

这段代码在语义上等同于：

```null
mgr = (EXPR)
aexit = type(mgr).__aexit__
aenter = type(mgr).__aenter__(mgr)
exc = True

VAR = await aenter
try:
    BLOCK
except:
    if not await aexit(mgr, *sys.exc_info()):
        raise
else:
    await aexit(mgr, None, None, None)```

和常规的`with`表达式一样，可以在一个`async with`表达式中指定多个上下文管理器。

如果向`async with`表达式传入的上下文管理器中没有`__aenter__` 和`__aexit__`方法，这将引起一个错误 。如果在`async def`函数外面使用`async with`，将引起一个`SyntaxError`（语法错误）。

### 例子

使用`async with`能够很容易地实现一个数据库事务管理器。

```null
async def commit(session, data):
    ...

    async with session.transaction():
        ...
        await session.update(data)
        ...```

需要使用锁的代码也很简单：

```null
async with lock:
    ...```

而不是:

```null
with (yield from lock):
    ...```

异步迭代器 “async for”
-----------------

一个异步可迭代对象（asynchronous iterable）能够在迭代过程中调用异步代码，而异步迭代器就是能够在`next`方法中调用异步代码。为了支持异步迭代：

1、一个对象必须实现`__aiter__`方法，该方法返回一个异步迭代器（asynchronous iterator）对象。  
2、一个异步迭代器对象必须实现`__anext__`方法，该方法返回一个awaitable类型的值。  
3、为了停止迭代，`__anext__`必须抛出一个`StopAsyncIteration`异常。

异步迭代的一个例子如下:

```null
class AsyncIterable:
    def __aiter__(self):
        return self

    async def __anext__(self):
        data = await self.fetch_data()
        if data:
            return data
        else:
            raise StopAsyncIteration

    async def fetch_data(self):
        ...```

### 新语法

通过异步迭代器实现的一个新的迭代语法如下：

```null
async for TARGET in ITER:
    BLOCK
else:
    BLOCK2```

这在语义上等同于:

```null
iter = (ITER)
iter = type(iter).__aiter__(iter)
running = True
while running:
    try:
        TARGET = await type(iter).__anext__(iter)
    except StopAsyncIteration:
        running = False
    else:
        BLOCK
else:
    BLOCK2```

把一个没有`__aiter__`方法的迭代对象传递给 `async for`将引起`TypeError`。如果在`async def`函数外面使用`async with`，将引起一个`SyntaxError`（语法错误）。

和常规的`for`表达式一样， `async for`也有一个可选的`else` 分句。.

### 例子1

使用异步迭代器能够在迭代过程中异步地缓存数据：

```null
async for data in cursor:
    ...```

这里的`cursor`是一个异步迭代器，能够从一个数据库中每经过N次迭代预取N行数据。

下面的语法展示了这种新的异步迭代协议的用法：

```null
class Cursor:
    def __init__(self):
        self.buffer = collections.deque()

    async def _prefetch(self):
        ...

    def __aiter__(self):
        return self

    async def __anext__(self):
        if not self.buffer:
            self.buffer = await self._prefetch()
            if not self.buffer:
                raise StopAsyncIteration
        return self.buffer.popleft()```

接下来这个`Cursor` 类可以这样使用：

```null
async for row in Cursor():
    print(row)
which would be equivalent to the following code:

i = Cursor().__aiter__()
while True:
    try:
        row = await i.__anext__()
    except StopAsyncIteration:
        break
    else:
        print(row)```

### 例子2

下面的代码可以将常规的迭代对象变成异步迭代对象。尽管这不是一个非常有用的东西，但这段代码说明了常规迭代器和异步迭代器之间的关系。

```null
class AsyncIteratorWrapper:
    def __init__(self, obj):
        self._it = iter(obj)

    def __aiter__(self):
        return self

    async def __anext__(self):
        try:
            value = next(self._it)
        except StopIteration:
            raise StopAsyncIteration
        return value

async for letter in AsyncIteratorWrapper("abc"):
    print(letter)```

### 为什么要抛出StopAsyncIteration?

协程（Coroutines）内部仍然是基于生成器的。因此在[PEP 479](https://www.python.org/dev/peps/pep-0479/)之前，下面两种写法没有本质的区别：

```null
def g1():
    yield from fut
    return 'spam'```

和

```null
def g2():
    yield from fut
    raise StopIteration('spam')```

自从 [PEP 479](https://www.python.org/dev/peps/pep-0479/) 得到接受并成为协程 的默认实现，下面这个例子将`StopIteration`包装成一个`RuntimeError`。

```null
async def a1():
    await fut
    raise StopIteration('spam')    ```

告知外围代码迭代已经结束的唯一方法就是抛出`StopIteration`。因此加入了一个新的异常类`StopAsyncIteration`。

由PEP 479的规定 , 所有协程中抛出的`StopIteration`异常都被包装在`RuntimeError`中。 
 [https://blog.csdn.net/tinyzhao/article/details/52684473](https://blog.csdn.net/tinyzhao/article/details/52684473)
````
