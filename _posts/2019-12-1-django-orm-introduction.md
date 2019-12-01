---
layout: post
title: 'ORM简介'
subtitle: '本文所属django中orm字段及使用方法概述'
date: 2019-12-1 02:30:00
author: qifeng
color: rgb(255,90,90)
cover: 'https://raw.githubusercontent.com/systemime/my_image/master/orm_in.jpg'
tags: django orm
---

## ORM简介  

> 本文所述django中ORM

#### 什么是ORM  
- 全称：object relational mapping，通过使用它，我们可以直接使用python的方法去使用数据库  

- 通过把表映射成类，把行作为实例，把字段作为属性，orm在执行对象操作的时候会把对应的操作转换成数据库原生语句的方式来完成数据库开发工作  

#### ORM的优点  
- 使用简单，通过将数据库语法进行封装，直接使用方法即可操作数据库  
- 性能好，在通过orm转换成sql的时候是会有一些消耗，但这个消耗其实非常低，在对整体业务提升的角度说，这点消耗可以忽略不计，除非你对于io操作的要求非常的极端  
- 兼容性好，支持目前市面上多数的关系型数据库，如mysql prestresql salite等  

## 基础配置  

> 注意修改自己django或其他文件安装路径  

#### 使用pymysql代替mysqlclient  

> 在django中，mysql连接的默认客户端是mysqlclient，但是其并不支持python3  

- 执行初始化命令 `python manage.py makemigrations` 报错信息  
    ```text  
    (base) [soul@listener one_orm]$ python manage.py makemigrations
    Traceback (most recent call last):
      File "manage.py", line 21, in <module>
        main()
      File "manage.py", line 17, in main
        execute_from_command_line(sys.argv)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 381, in execute_from_command_line
        utility.execute()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 357, in execute
        django.setup()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/__init__.py", line 24, in setup
        apps.populate(settings.INSTALLED_APPS)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/registry.py", line 114, in populate
        app_config.import_models()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/config.py", line 211, in import_models
        self.models_module = import_module(models_module_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "<frozen importlib._bootstrap>", line 994, in _gcd_import
      File "<frozen importlib._bootstrap>", line 971, in _find_and_load
      File "<frozen importlib._bootstrap>", line 955, in _find_and_load_unlocked
      File "<frozen importlib._bootstrap>", line 665, in _load_unlocked
      File "<frozen importlib._bootstrap_external>", line 678, in exec_module
      File "<frozen importlib._bootstrap>", line 219, in _call_with_frames_removed
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/models.py", line 2, in <module>
        from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/base_user.py", line 47, in <module>
        class AbstractBaseUser(models.Model):
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 117, in __new__
        new_class.add_to_class('_meta', Options(meta, app_label))
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 321, in add_to_class
        value.contribute_to_class(cls, name)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/options.py", line 204, in contribute_to_class
        self.db_table = truncate_name(self.db_table, connection.ops.max_name_length())
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/__init__.py", line 28, in __getattr__
        return getattr(connections[DEFAULT_DB_ALIAS], item)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 201, in __getitem__
        backend = load_backend(db['ENGINE'])
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 110, in load_backend
        return import_module('%s.base' % backend_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/base.py", line 36, in <module>
        raise ImproperlyConfigured('mysqlclient 1.3.13 or newer is required; you have %s.' % Database.__version__)
    django.core.exceptions.ImproperlyConfigured: mysqlclient 1.3.13 or newer is required; you have 0.9.3.
    ```  

- 修改 `init.py` 文件  
    修改项目setting同文件目录下的 `init.py` 文件，添加如下代码：  
    ```python
    import pymysql
    # 告诉Django，用pymysql代替MySQLdb（MySQLdb不支持中py3）
    pymysql.install_as_MySQLdb()
    
    ```  

#### 修改版本限制  

> 在django中，虽然我们使用 `pymysql` 替换 `mysqlclient` ，但django仍然会检查 `mysqlclient` 的版本，所以会出先如下报错  

    ```text  
    (base) [soul@listener one_orm]$ python manage.py makemigrations
    Traceback (most recent call last):
      File "manage.py", line 21, in <module>
        main()
      File "manage.py", line 17, in main
        execute_from_command_line(sys.argv)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 381, in execute_from_command_line
        utility.execute()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 357, in execute
        django.setup()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/__init__.py", line 24, in setup
        apps.populate(settings.INSTALLED_APPS)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/registry.py", line 114, in populate
        app_config.import_models()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/config.py", line 211, in import_models
        self.models_module = import_module(models_module_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "<frozen importlib._bootstrap>", line 994, in _gcd_import
      File "<frozen importlib._bootstrap>", line 971, in _find_and_load
      File "<frozen importlib._bootstrap>", line 955, in _find_and_load_unlocked
      File "<frozen importlib._bootstrap>", line 665, in _load_unlocked
      File "<frozen importlib._bootstrap_external>", line 678, in exec_module
      File "<frozen importlib._bootstrap>", line 219, in _call_with_frames_removed
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/models.py", line 2, in <module>
        from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/base_user.py", line 47, in <module>
        class AbstractBaseUser(models.Model):
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 117, in __new__
        new_class.add_to_class('_meta', Options(meta, app_label))
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 321, in add_to_class
        value.contribute_to_class(cls, name)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/options.py", line 204, in contribute_to_class
        self.db_table = truncate_name(self.db_table, connection.ops.max_name_length())
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/__init__.py", line 28, in __getattr__
        return getattr(connections[DEFAULT_DB_ALIAS], item)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 201, in __getitem__
        backend = load_backend(db['ENGINE'])
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 110, in load_backend
        return import_module('%s.base' % backend_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/base.py", line 36, in <module>
        raise ImproperlyConfigured('mysqlclient 1.3.13 or newer is required; you have %s.' % Database.__version__)
    django.core.exceptions.ImproperlyConfigured: mysqlclient 1.3.13 or newer is required; you have 0.9.3.
    (base) [soul@listener one_orm]$ ^C
    (base) [soul@listener one_orm]$ python manage.py makemigrations
    Traceback (most recent call last):
      File "manage.py", line 21, in <module>
        main()
      File "manage.py", line 17, in main
        execute_from_command_line(sys.argv)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 381, in execute_from_command_line
        utility.execute()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/core/management/__init__.py", line 357, in execute
        django.setup()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/__init__.py", line 24, in setup
        apps.populate(settings.INSTALLED_APPS)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/registry.py", line 114, in populate
        app_config.import_models()
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/apps/config.py", line 211, in import_models
        self.models_module = import_module(models_module_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "<frozen importlib._bootstrap>", line 994, in _gcd_import
      File "<frozen importlib._bootstrap>", line 971, in _find_and_load
      File "<frozen importlib._bootstrap>", line 955, in _find_and_load_unlocked
      File "<frozen importlib._bootstrap>", line 665, in _load_unlocked
      File "<frozen importlib._bootstrap_external>", line 678, in exec_module
      File "<frozen importlib._bootstrap>", line 219, in _call_with_frames_removed
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/models.py", line 2, in <module>
        from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/contrib/auth/base_user.py", line 47, in <module>
        class AbstractBaseUser(models.Model):
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 117, in __new__
        new_class.add_to_class('_meta', Options(meta, app_label))
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/base.py", line 321, in add_to_class
        value.contribute_to_class(cls, name)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/models/options.py", line 204, in contribute_to_class
        self.db_table = truncate_name(self.db_table, connection.ops.max_name_length())
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/__init__.py", line 28, in __getattr__
        return getattr(connections[DEFAULT_DB_ALIAS], item)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 201, in __getitem__
        backend = load_backend(db['ENGINE'])
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/utils.py", line 110, in load_backend
        return import_module('%s.base' % backend_name)
      File "/home/soul/anaconda3/lib/python3.6/importlib/__init__.py", line 126, in import_module
        return _bootstrap._gcd_import(name[level:], package, level)
      File "/home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/base.py", line 36, in <module>
        raise ImproperlyConfigured('mysqlclient 1.3.13 or newer is required; you have %s.' % Database.__version__)
    django.core.exceptions.ImproperlyConfigured: mysqlclient 1.3.13 or newer is required; you have 0.9.3.
    
    ```  

- **解决方案：** 修改 `django` 关于 `mysql` 配置源码
    ```python
    # 文件路径(按照自己的修改)
    # /home/soul/anaconda3/lib/python3.6/site-packages/django/db/backends/mysql/base.py
    # 注释如下部分(35行)
      
    # if version < (1, 3, 13):
    #     raise ImproperlyConfigured('mysqlclient 1.3.13 or newer is required; you have %s.' % Database.__version__)
    
    ```  

## 配置mysql连接  
    在 `setting.py` 中，修改DATABASES部分配置如下  
    
    ```text
    # Database
    # https://docs.djangoproject.com/en/2.2/ref/settings/#databases
    
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',  # 数据库引擎
            'NAME': 'lession4',
            'USER': 'root',
            'PASSWORD': '****,
            'HOST': '127.0.0.1',
            'PORT': '3306',
        }
    }
    ```

#### models.py编写  
```python
from django.db import models

# Create your models here.


class Test(models.Model):
    name = models.CharField(max_length=20)


class User(models.Model):
    username = models.CharField(unique=True, max_length=50, blank=False)  # 唯一索引,不允许为空
    age = models.SmallIntegerField(default=0)
    phone = models.IntegerField(db_index=True, blank=True, default=0)  # 普通索引
    email = models.EmailField(blank=True, default='')
    info = models.TextField(default='')
    create_time = models.DateTimeField(auto_now_add=True)
    update_time = models.DateTimeField(auto_now=True)

    # 联合索引,
    class Meta:
        index_together = ['username', 'phone']

    def __str__(self):
        return 'user:{}'.format(self.username)


# 一对一数据表, 一人一个生日
class Userprofile(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.SET_NULL)
    # 一对一, on_delete, null=True是必要参数, 删除时可以设置为空，django2.2新增类型OneToOneField
    birthday = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return 'user: {}, birthday: {}'.format(self.user.username, self.birthday)


# 一对多数据表， 一个人多个日记
class Diary(models.Model):
    user = models.ForeignKey(User, related_name='diary', on_delete=models.SET_NULL, blank=True, null=True)
    # 自定义外键名称related_name
    content = models.TextField()
    # 时间类型实际存入int型，等于存入时间戳，便于不同场景下的时间转换
    create_time = models.IntegerField()

# 多对多数据表，一个人有多个组，一个组里有多个人
class Group(models.Model):
    user = models.ManyToManyField(User, related_name='group')
    name = models.CharField(max_length=20)
    create_time = models.IntegerField()
```  

#### 数据同步  
- Python mange.py makemigrateions 在migrate文件夹下生成 initialpy脚本文件   

- Python manage.py migrate 将initialpy脚本中的代码执行，生成相对应的数据表  

#### 字段对应SQL类型  
1. 字符串与数字类型  

    |字段名                      |描述               |例子                                               |
    |---------------------------|-------------------|--------------------------------------------------|
    | CharField                 | 字符串类型           | ‘namexxxx’                                      |
    | TextField                 | 文本类型            | ‘xxxxxxxxxxxx…’                                 |
    | EmailField                | 邮箱类型            | ‘xxx@muke\.com’                                 |
    | UrlField                  | 网址类型            | ’http://muke\.com’                              |
    | BooleanField              | 布尔类型\(tinyint\) | True False                                      |
    | NullBooleanField          | 可为空的布尔类型     | None True False                                 |
    | IntegerField              | 整型               | \(\-2147483648, 2147483647\)                    |
    | SmallIntegerField         | 短整型              | \(\-32768, 32767\)                              |
    | BigIntegerField           | 长整型              | \(\-9223372036854775808, 9223372036854775807\), |
    | PositiveIntegerField      | 正整型              | \(0, 2147483647\)                               |
    | PositiveSmallIntegerField | 短正整型            | \(0, 32767\)                                    |
    | FloatField                | 浮点类型            | 3\.14                                           |
    | DecimalField              | 十进制小树          | 12345\.12312                                    |
  
2. 时间类型  

    | 字段名         | 描述  | 例子                     |
    |---------------|------|--------------------------|
    | DateField     | 日期类型 | xxxx\-xx\-xx          |
    | DateTimeField | 日期类型 | xxxx\-xx\-xx xx:xx:xx |
    | TimeField     | 时间类型 | xx:xx:xx  \(时分秒\)   |  
    
3. 文件类型  

    | 字段名      | 描述     | 例子     |
    |------------|---------|----------|
    | ImageField | 图片类型 | xxx\.jpg |
    | FileField  | 文件类型 | 任意文件类型|
  
4. 特殊类型属性介绍  

    | 属性名           | 描述                                            | 例子           | 作用于                   |
    |-----------------|-------------------------------------------------|--------------|-----------------------|
    | max\_digits     | 数字中允许的最大位数                       | 12           | DecimalField          |
    | decimal\_places | 存储的十进制位数                          | 2            | DecimalField          |
    | width\_field    | 图片宽\(可不传\)                         | 1024         | ImageField            |
    | height\_field   | 图片高\(可不传\)                         | 576          | ImageField            |
    | upload\_to      | 保存上传文件的本地文件路径，该路径由 MEDIA\_ROOT 中设置 | ‘/xx/xx\.xx’ | ImageField, FileField |
  
5. 公共属性介绍  

    | 属性名          | 描述             | 例子       | 作用于  |
    |----------------|-----------------|------------|--------|
    | null           | 值是否设为空          | True False |
    | blank          | 值是否可为空          | True False |
    | primary\_key   | 设置主键            | True       | 整型   |
    | auto\_now      | 时间自动添加          | True       | 时间类型 |
    | auto\_now\_add | 自动添加时间，但仅在创建的时候 | True       | 时间类型 |
    | max\_length    | 字段长度            | 字符串类型      |
    | default        | 默认值             | xxx        |
    | verbose\_name  | admin中显示的名字     | name       |
    | db\_column     | 数据库字段名          | age        |
    | unique         | 唯一索引            | True       |
    | de\_index      | 普通索引            | True       |
  
6. 表关联方法  

    | 字段名             | 描述  | 例子 |
    |-----------------|-----|----|
    | ForeignKey      | 一对多 | |
    | OneToOneField   | 一对一 | |
    | ManyToManyField | 多对多 | |
    
    定义外键关系，如 `OneToOne`, `OneToMany`, `ManyToMany`关系中的 `models.OneToOneField`, `models.ForeignKey`, `models.ManyToManyField`字段时，拥有如下属性  
    
    | 属性名           | 描述       | 例子                                                |
    |---------------|----------|---------------------------------------------------|
    | related\_name | 关联表的名    | related\_name=‘profile’                           |
    | on\_delete    | 外键的删除的对策 | on\_delete=models\. SET\_NULL\(CASCADE, PROTECT\) |
  
    实例代码：  
    
    ```python
    user = models.OneToOneField(User, null=True, on_delete=models.SET_NULL)
    
    user = models.ForeignKey(User, related_name='diary', on_delete=models.SET_NULL, blank=True, null=True)
    
    user = models.ManyToManyField(User, related_name='group')
    ```  
   
   注： `ManyToManyField` 没有 `on_delete` 属性  

