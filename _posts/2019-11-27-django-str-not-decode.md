---
layout: post
title: 'django2.2关于"str object has no attribute decode" 的错误处理'
subtitle: 'django2.2这段报错在django的github仓库中已修复，但是还未发布，本文说明几种处理方法'
date: 2019-11-27
author: qifeng
color: rgb(255,90,90)
cover: 'https://systemime.github.io/img/123.jpg'
tags: error django
---  
## 关于 `'str' object has no attribute 'decode'` 的报错处理  

- 报错代码段  

    ```python
        # 位于/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/operations.py 
        # 第140行
        def last_executed_query(self, cursor, sql, params):
            # With MySQLdb, cursor objects have an (undocumented) "_executed"
            # attribute where the exact query sent to the database is saved.
            # See MySQLdb/cursors.py in the source distribution.
            query = getattr(cursor, '_executed', None)
            # print("=========================>>>>>>>>", type(query))
            # 这句话是我自己加的
            if query is not None:
                query = query.decode(errors='replace')
            return query
    ```  

- 报错信息  
  同时可以看出 `getattr` 函数返回值类型为 `str`
    ```text
    (base) [soul@listener one_orm]$ python manage.py makemigrations
    =========================>>>>>>>> <class 'str'>
    Traceback (most recent call last):
      File "manage.py", line 21, in <module>
        main()
      File "manage.py", line 17, in main
        execute_from_command_line(sys.argv)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 381, in execute_from_command_line
        utility.execute()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 375, in execute
        self.fetch_command(subcommand).run_from_argv(self.argv)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/base.py", line 323, in run_from_argv
        self.execute(*args, **cmd_options)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/base.py", line 364, in execute
        output = self.handle(*args, **options)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/base.py", line 83, in wrapped
        res = handle_func(*args, **kwargs)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/commands/makemigrations.py", line 101, in handle
        loader.check_consistent_history(connection)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/migrations/loader.py", line 283, in check_consistent_history
        applied = recorder.applied_migrations()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/migrations/recorder.py", line 73, in applied_migrations
        if self.has_table():
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/migrations/recorder.py", line 56, in has_table
        return self.Migration._meta.db_table in self.connection.introspection.table_names(self.connection.cursor())
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/base/base.py", line 256, in cursor
        return self._cursor()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/base/base.py", line 233, in _cursor
        self.ensure_connection()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/base/base.py", line 217, in ensure_connection
        self.connect()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/base/base.py", line 197, in connect
        self.init_connection_state()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/base.py", line 231, in init_connection_state
        if self.features.is_sql_auto_is_null_enabled:
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/utils/functional.py", line 80, in __get__
        res = instance.__dict__[self.name] = self.func(instance)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/features.py", line 82, in is_sql_auto_is_null_enabled
        cursor.execute('SELECT @@SQL_AUTO_IS_NULL')
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/utils.py", line 103, in execute
        sql = self.db.ops.last_executed_query(self.cursor, sql, params)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/operations.py", line 147, in last_executed_query
        query = query.decode(errors='replace')
    AttributeError: 'str' object has no attribute 'decode'
    ```

#### 编码解码解释

> 内存的Unicode格式编码成为硬盘Utf-8格式，逆过程为解码

- **编码：** 将文本转换成字节流的过程。即 `Unicode`，特定格式的编码方式，产生特定的字节流保存在硬盘中(一般为utf-8格式)
- **解码：** 将硬盘中的字节流转换成文本的过程。即特定格式的字节流 `Unicode`  
- **注意：** 在内存中写的所有的字符，一视同仁，都是Unicode编码，但只有往硬盘保存或者基于网络传输时，才能确定你输入的字符是英文还好汉文，这就是`Unicode`转换成其他编码格式的过程。

* decode("utf-8", "ignore") 忽略其中有异常的编码，仅显示有效的编码  
* decode("utf-8", "replace") 替换其中异常的编码，这个相对更容易找出错误字符编码  

#### python3中字符串格式  

- 文本字符串类型：  
  即我们通常定义的str类型的对象。在Python3中，str类型的对象都是Unicode，因此对于str类型的对象只有encode（）方法，没有decode（）方法（若运行，会报错）
- 字节字符串类型：  
  即byte类型的对象。对于该类对象，是由str类型对象使用encode()方法产生，byte对象可以进行解码过程，从而得到真正的内容
  
> 其实到这里我们已经知道报错原因了，继续往下看  

#### python3中 `getattr()` 函数  
- 描述：  
  getattr()函数用于返回一个对象属性值  
- 语法：  

    ```
    getattr(object,name,default)
    ```  

- 参数：  
    - `object`--对象  
    - `name`--字符串，对象属性  
    - `default`--默认返回值，如果不提供该参数，在没有对于属性时，将触发AttributeError  

- 返回值：  
  返回对象属性值  
  
    ```python
    class People:
      country='China'
      def __init__(self,name):
        self.name=name
     
      def people_info(self):
        print('%s is xxx' %(self.name))
    obj=getattr(People,'country')
    print(obj)
    #返回值China
    #obj=getattr(People,'countryaaaaaa')
    #print(obj)
    #报错
    # File "/getattr()函数.py", line 32, in <module>
    #   obj=getattr(People,'countryaaaaaa')
    # AttributeError: type object 'People' has no attribute 'countryaaaaaa'
    obj=getattr(People,'countryaaaaaa',None)
    print(obj)
    #返回值None
    ```  

## 修改方案  

> 结合上面python3中字符串的相关知识与 `getattr` 函数返回值类型可以断定，这里的错误是由于 `str` 没有 `decode（）` 方法引起的  

#### 方案一  
直接对这两句代码进行注释  

```python
# 位于/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/operations.py 
# 第140行
def last_executed_query(self, cursor, sql, params):
    # With MySQLdb, cursor objects have an (undocumented) "_executed"
    # attribute where the exact query sent to the database is saved.
    # See MySQLdb/cursors.py in the source distribution.
    query = getattr(cursor, '_executed', None)
    # if query is not None:
    #     query = query.decode(errors='replace')
    return query
```  

#### 方案二  
这个方案看起来有些多余，对比 `django` 1.11版本代码以及代码段注释，这段代码加入的具体意义有些莫名其妙  

但是为了保险起见，可以加入 `try` 方法达到另一种注释的方法  

```python
def last_executed_query(self, cursor, sql, params):
    # With MySQLdb, cursor objects have an (undocumented) "_executed"
    # attribute where the exact query sent to the database is saved.
    # See MySQLdb/cursors.py in the source distribution.
    query = getattr(cursor, '_executed', None)
    try:
        if query is not None:
            query = query.decode(errors='replace')
        return query
    except:
        return query
```  

## 还没结束！！！  
众所周知，`django` 是个开源项目，那么为什么去不去github上看看呢？

我在 `Pull requests` 中并没有找到想要的答案，于是我在django项目里按照目录寻找 `operations.py` 文件
```
django/django/db/backends/mysql/operations.py
```

果然，开源社区最棒！！！  

在最新的代码中， `last_executed_query` 函数被修改成如下  
```python
# 19年11月27日，位于157行
def last_executed_query(self, cursor, sql, params):
    # With MySQLdb, cursor objects have an (undocumented) "_executed"
    # attribute where the exact query sent to the database is saved.
    # See MySQLdb/cursors.py in the source distribution.
    # MySQLdb returns string, PyMySQL bytes.
    return force_str(getattr(cursor, '_executed', None), errors='replace')
```  

`force_str` 方法定义在 `django/django/utils/encoding.py` 的48行，对比目前代码  

本地的代码为：
```python
...
class DjangoUnicodeDecodeError(UnicodeDecodeError):
    def __init__(self, obj, *args):
        self.obj = obj
        super().__init__(*args)

    def __str__(self):
        return '%s. You passed in %r (%s)' % (super().__str__(), self.obj, type(self.obj))

...
def is_protected_type(obj):
    """Determine if the object instance is of a protected type.

    Objects of protected types are preserved as-is when passed to
    force_text(strings_only=True).
    """
    return isinstance(obj, _PROTECTED_TYPES)

def force_text(s, encoding='utf-8', strings_only=False, errors='strict'):
    """
    Similar to smart_text, except that lazy instances are resolved to
    strings, rather than kept as lazy objects.

    If strings_only is True, don't convert (some) non-string-like objects.
    """
    # Handle the common case first for performance reasons.
    if issubclass(type(s), str):
        return s
    if strings_only and is_protected_type(s):
        return s
    try:
        if isinstance(s, bytes):
            s = str(s, encoding, errors)
        else:
            s = str(s)
    except UnicodeDecodeError as e:
        raise DjangoUnicodeDecodeError(s, *e.args)
    return s

...

force_str = force_text

```  

对比发现，(本地环境为 `django2.2.6` )，在我本地django源码中，`force_str` 方法和 `force_text` 相同，而其他部分与github目前代码相同，尝试修改`operations.py` 文件与github相同

```python
from django.utils.encoding import force_text

...

def last_executed_query(self, cursor, sql, params):
    # With MySQLdb, cursor objects have an (undocumented) "_executed"
    # attribute where the exact query sent to the database is saved.
    # See MySQLdb/cursors.py in the source distribution.
    # MySQLdb returns string, PyMySQL bytes.
    return force_text(getattr(cursor, '_executed', None), errors='replace')
```  

运行测试：
```
(base) [soul@listener one_orm]$ python manage.py makemigrations
No changes detected
```  

奥利给！！！！！

> 到此，问题解决

