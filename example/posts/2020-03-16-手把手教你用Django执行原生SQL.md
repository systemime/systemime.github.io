---
title: 手把手教你用Django执行原生SQL
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

击上方 “**Python 爬虫与数据挖掘**”，进行关注

回复 “**书籍**” 即可获赠 Python 从入门到进阶共 10 本电子书

今

日

鸡

汤

秦时明月汉时关，万里长征人未还。

## 前言

Hey，各位小伙伴，这次怎么来玩一下, 如何使用 Django 执行原生 SQL。

我们都知道，Python 在 web 界的扛把子——Django，可谓是集大成为统一，各种各样的插件、forms 组件、model 模型、Admin 后台等等，后面我会专门出文章娓娓道来，反正就是一个字，NB。

本次就来学一下, 如何在 Django 执行原生语句。

## 起因

在使用 Django 时, 一般情况下, 我们使用 Django 自带的 model 查询是没有问题的, 基本能满足 80% 的问题

但是, 但是, 那 20% 就不要了吗??? 肯定不行哎, 小孩才做选择

在 Django 执行原生 SQL 有以下三种方式

-   extra
-   raw
-   django connection

一般情况下, 就以上三种方式

## 表结构

文件:`django_project/app01/models`

```python
class Book(models.Model):
    title = models.CharField(verbose_name="书名", max_length=32)
    describe = models.TextField(verbose_name="描述")
    author = models.CharField(verbose_name="作者", max_length=32)
    publisher = models.CharField(verbose_name="出版社", max_length=32)
    publisher_date = models.DateField(verbose_name="publisher")
```

就是一个很简单的图书表  

通过 admin 录入一些数据测试使用

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacILKI9u6VjdMg4P8VrVOkAOXn2wIDjrmQs0DicOPYGGOVSqZdFf2WTrA/640?wx_fmt=png)

extra 方式  

* * *

强烈建议, 不用学, 没毛用

## raw 方式

这个相比较 extra, 还是比较有用的,

语法如下

```css
models.表名.objecs.raw(sql)
models.表名.objecs.raw(sql,[参数1,参数2])
```

**注: 如果没有参数, 就只写 sql 语句, 如果由参数, 后面需要用列表, 如图所示**  

举例

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiac3pAvpFMny9AvAsIyUJS91Vic5ibvfH4IBgWVo5Pv8oOsGn54hkRIY2Dg/640?wx_fmt=png)

返回的仍然一个个的 Book 对象  

## 真正的原生 sql 方式

上述的，其实还是和 django 的 model 有些绑定。但是我就是说，我就是想要原生 sql，不要跟任何绑定。

这里说一下，千万不要在 django 使用 pymysql 执行原生 sql，会发生一些奇怪的问题。一定要导入`from django.db import connection`执行 sql。代码如下：

```python
from django.db import connection
def book_list(request):
    
    cursor = connection.cursor()
    print(type(cursor))
    cursor.execute("select * from app01_book where id=%s", [1, ])
    raw = cursor.fetchall()
    print(raw)
```

返回内容如下图所示：  

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacgkwBUNxqxJHTTkMzTWicz0eXffuae1GMdmWA3cLqdRy80buwpoLzE8w/640?wx_fmt=png)

可以看到，返回的是列表里面套一个个的数组。我就在想，有没有什么办法能将查询出来的 sql，直接返回成字典呢？答案是当然可以！

## 执行原生 sql 并且返回成 dict

我将执行原生 sql 并且直接返回成字典的方式封装成了两个函数

一个是查询多个，代码如下所示：

```python
def query_all_dict(sql, params=None):
    '''
    查询所有结果返回字典类型数据
    :param sql:
    :param params:
    :return:
    '''
    with connection.cursor() as cursor:
        if params:
            cursor.execute(sql, params=params)
        else:
            cursor.execute(sql)
        col_names = [desc[0] for desc in cursor.description]
        row = cursor.fetchall()
        rowList = []
        for list in row:
            tMap = dict(zip(col_names, list))
            rowList.append(tMap)
        return rowList
```

一个是查询一个，代码如下所示：  

```python
def query_one_dict(sql, params=None):
    """
    查询一个结果返回字典类型数据
    :param sql:
    :param params:
    :return:
    """
    with connection.cursor() as cursor:
        if params:
            cursor.execute(sql, params=params)
        else:
            cursor.execute(sql)
        col_names = [desc[0] for desc in cursor.description]
        row = cursor.fetchone()
        tMap = dict(zip(col_names, row))
        return tMap
```

用法如下, 直接在视图中调用函数  

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiac9RkbcrhPSdrFz95ibHOLn8cmyRib8QVGyamB9pI36XEHcApJBiaDWA8kg/640?wx_fmt=png)

返回结果如下, 直接是列表套字典格式  

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacXA2BqENm301ZyPqFKSwJwB2U3C2XcS6P8icjQwsyIyzF2WDJcEibt2cg/640?wx_fmt=png)

那查询带条件的怎么办哪, 其实和 pymysql 一个样  

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacWuYUd18d2XPBaPMwEeuaibBickvLD0p9MnDogl4eYkQIUiaD1RD4qGZlQ/640?wx_fmt=png)

返回结果  

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacWUUJ6kRCbGUicDEX7O4Nk2RC88nFZoCsvcnHyGmgu3UyOnM2Lt8O1kg/640?wx_fmt=png)

但是有个问题，上面的查询, 我们明明知道，让只会返回一个值，但是还是返回的是列表套字典格式，似乎不太对呐？  

其实上述我写的是两个办法，如果确定就查询一个值，使用`query_one_dict`方法。

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiace8Pic9ENZrbYSBtyibSeXHguTW4CvwibiagVrAkP4icfRyTMyJbkAFMzTtA/640?wx_fmt=png)

![](https://mmbiz.qpic.cn/mmbiz_png/icjSAZybsq56ysClcwuAm50NmZXwxKibiacsNuUpKkxgykyPOwtXw0pia5m0GH7bPI4DucUkOvXibUUdyibbGlA8yGicQ/640?wx_fmt=png)

## 上述总结

django 中执行原生 sql 有 3 种方式,`extra`,`raw`,`from django.db import connection`

其中`extra`基本没用,`raw`凑合, 但是和`models`有绑定,`connection`最灵活, 但是默认返回的是\[tuple,tuple,tuple,]格式

经过改良, 封装出两个方法,`query_all_dict`,`query_one_dict`, 一个是查询多个, 一个是查询单个, 并且返回成\[dict,dict,dict,]

**建议**

只使用`query_all_dict`,`query_one_dict`

## 项目代码

```css
django_exec_sql.zip
```

需要本文完整代码的小伙伴，可以在本公众号后台回复关键字：**原生 SQL**，进行获取。

总结  

* * *

上述以入门的方式解决了安排了以下如何通过 django 执行原生 sql。

用微笑告诉别人，今天的我比昨天强，今后也一样。  

如果你觉得文章还可以，记得点赞留言支持我们哈。感谢你的阅读，有问题请记得在下方留言噢~

想学习更多关于 Python 的知识，可以参考学习网址：[http://pdcfighting.com/，点击阅读原文，可以直达噢~](http://pdcfighting.com/，点击阅读原文，可以直达噢~)

****\*\*****---**--****\*\*******---\***\*---**\*\*\*\*****---**--****\*\*******---****************\*\*\*\***************** End ****\*\*****---**--****\*\*******---**--**---****\*\*****---**--****\*\*******-****************\*\*\*\*****************

往期精彩文章推荐：

-   ## [手把手教你用 Python 制作简易小说阅读器](http://mp.weixin.qq.com/s?__biz=MzU3MzQxMjE2NA==&mid=2247490914&idx=1&sn=d8d65ee63b5dcee5794dfb982eb9d9e3&chksm=fcc35b49cbb4d25f051b3512e204b2e782131329b7a2dcab3e527ef3d77c901b9957555cf66e&scene=21#wechat_redirect)
-   ## [一篇文章总结一下 Python 库中关于时间的常见操作](http://mp.weixin.qq.com/s?__biz=MzU3MzQxMjE2NA==&mid=2247490901&idx=1&sn=7e20ac4d4fd9c41b363cf85e679774b7&chksm=fcc35b7ecbb4d268fde21f590030bac79f683cdd658623c794916e5b880846917d275da9292b&scene=21#wechat_redirect)
-   [盘点 5 种基于 Python 生成的个性化语音方法](http://mp.weixin.qq.com/s?__biz=MzU3MzQxMjE2NA==&mid=2247490818&idx=1&sn=c2e8a0433baaafe751ddebca7716ad80&chksm=fcc35b29cbb4d23f3cbe40202c5f7e15e9363507ba4305ce9b13993dc85ba82826377bcdb5e4&scene=21#wechat_redirect)  

    * * *

![](https://mmbiz.qpic.cn/mmbiz_png/peDq5Y9hmZaHvs19XSuQEGbkast75g4uziam64mHRseaJibQEIZGUgwWthoqHAiakAXcicszKuT0OgAbXM2k2hiaSyA/640?wx_fmt=png)

欢迎大家**点赞，\*\***留言，\***\* 转发，**转载，\*\*\*\* 感谢大家的相伴与支持

想加入 Python 学习群请在后台回复【**入群**】

万水千山总是情，点个【**在看**】行不行

**/ 今日留言主题 /**

随便说一两句吧\~~ 
 [https://mp.weixin.qq.com/s/2hTvkLmcHX2oJMBjBN-X0Q](https://mp.weixin.qq.com/s/2hTvkLmcHX2oJMBjBN-X0Q) 
 [https://mp.weixin.qq.com/s/2hTvkLmcHX2oJMBjBN-X0Q](https://mp.weixin.qq.com/s/2hTvkLmcHX2oJMBjBN-X0Q)
