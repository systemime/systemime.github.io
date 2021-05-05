---
title: contextlib装饰器使用
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

<a name="44YBr"></a>
# 一、生成器
生成器是一个特殊的迭代器，能够通过next获取返回值，但是保留原函数状态，能节省内存空间<br />

<a name="oanXO"></a>
# 二、上下文管理器
上下文管理器是python2.5以后引入的功能，能够精确的分配和释放资源，python关键字为with
<a name="hNyaD"></a>
# 三、自定义上下文管理器
```python
class MyResource:
    # __enter__ 返回的对象会被with语句中as后的变量接受
    def __enter__(self):
        print('connect to resource')
        return self

    def __exit__(self, exc_type, exc_value, tb):
        print('close resource conection')

    def query(self):
        print('query data')
```
其中

- __enter__: with语句中的代码执行前会先执行这里的代码，一般用于资源获取
- __exit__： with语句中代码执行结束后执行，一般用于资源回收
<a name="bKprI"></a>
# 四、Contextlib装饰器
我们如果自己想定义能够被上下文处理器处理的函数如此写可能还比较复杂，而上下午处理器中还包括异常处理等其他方法，那么有没有简单的方法呢，或者当我们定义一个类等时候应该怎么去做呢
```python
import contextlib
import time


class X(object):
    def __inti__(self):
        self.db = 0
    @property
    def ddl(self):
        return True
    
    @property
    @contextlib.contextmanager
    def ssr(self):
        print("first print ...")
        yield self
        time.sleep(3)
        print("end")
        return True

with X().ssr as f:
    print(f.ddl)

"""输出
first print ...
True
end
"""
        
```
如输出看，contextmanager装饰器将函数分为三个部分，

- with语句执行时，执行类中yield关键字以前的函数
- yield返回变量赋值给as之后的变量，然后执行with下方的代码块
- 最后执行类中yield关键字之后的代码
<a name="NQ1J5"></a>
# sqlalchemy数据库自动提交与回滚
在编程中如果频繁的修改数据库, 一味的使用类似`try:... except..: rollback() raise e`其实是不太好的.<br />比如某一段的代码的是这样的:
```python
   try:
        gift = Gift()
        gift.isbn = isbn
        ... 
        db.session.add(gift)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        raise e
```
为了达到with语句目的，我们可以重写db所属类
```python
from flask_sqlalchemy import SQLAlchemy as _SQLALchemy
class SQLAlchemy(_SQLALchemy):
    @contextmanager
    def auto_commit(self):
        try:
            yield
            self.session.commit()
        except Exception as e:
            db.session.rollback()
            raise e
```
此时，执行数据修改便可以：
```python
 with db.auto_commit():
        gift = Gift()
        gift.isbn = isbndb.session.add(gift)
        db.session.add(gift)

with db.auto_commit():
    user = User()
    user.set_attrs(form.data)
    db.session.add(user)
```


