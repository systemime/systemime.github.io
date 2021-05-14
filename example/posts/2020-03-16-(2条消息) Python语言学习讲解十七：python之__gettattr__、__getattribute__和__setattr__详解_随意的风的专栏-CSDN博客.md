---
title: (2条消息) Python语言学习讲解十七：python之__gettattr__、__getattribute__和__setattr__详解_随意的风的专栏-CSDN博客
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

![](https://csdnimg.cn/release/blogv2/dist/pc/img/original.png)

[隨意的風](https://blog.csdn.net/Windgs_YF) 2016-12-01 15:49:45 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/articleReadEyes.png)
 2519 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect.png)
 收藏 

版权声明：本文为博主原创文章，遵循 [CC 4.0 BY-SA](http://creativecommons.org/licenses/by-sa/4.0/) 版权协议，转载请附上原文出处链接和本声明。

注：每周一到周五都会进行相关[Python](http://lib.csdn.net/base/11)基础知识更新，欢迎大家提宝贵的意见

python 语言提供了一种挂钩，使得开发者能够很方便的编写出通用代码，他们使用的不是普通实例的属性，@property 方法和描述符，而是使用的是 python 的魔术方法

\_\_gettattr\_\_、\_\_getattribute\_\_和\_\_setattr\_\_, 他们属于动态行为。

\>>> class TEST(object):

def \_\_init\_\_(self):  
self.value = 1  
def \_\_getattr\_\_(self, name):  
value = 'Value for %s' % name  
setattr(self, name, value)  
return value  
>>> testobj = TEST()  
>>> print('---:',testobj.\_\_dict\_\_)  
{'\_\_methods\_\_':'Value for \_\_methods\_\_','\_\_members\_\_':'Value for \_\_members\_\_','value': 1}

\>>> print(testobj.\_\_dict\_\_)  
{'\_\_methods\_\_':'Value for \_\_methods\_\_','\_\_members\_\_':'Value for \_\_members\_\_','value': 1}  
>>> print(testobj.attr)  
'Value for attr'  
>>> print(testobj.\_\_dict\_\_)  
{'\_\_methods\_\_':'Value for \_\_methods\_\_','\_\_members\_\_':'Value for \_\_members\_\_','value': 1,'attr':'Value for attr'}

**总结：** 

**\_\_gettattr\_\_: 如果某个类定义了这个方法，并且在该类的对象的字典中又找不到相应的属性时候，那么次方法会被调用。** 

**\_\_getattribute\_\_: 不管对象的字典中有没有找到对应的属性，都会调用**

**\_\_setattr\_\_: 无论是直接赋值还是通过内置的 setattr 函数赋值，都会调用**

**\*\*\*\*\*\*\*\*还有一点需要住的是\_\_**getattribute\_\_和\_\_setattr\_\_方法中访问实例属性的时候，应该直接通过 super() 来做，避免无线递归。\*\*\*\*\*\*\*\*\*\*

```python
def __getattribute__(self, name):        print("__getattribute__() is called name =", name)return object.__getattribute__(self, name)def __getattr__(self, name):        print("__getattr__() is called name =", name)return name + " from getattr"def __get__(self, instance, owner):        print("__get__() is called instance = {} owner = {}".format(instance, owner))if __name__ == '__main__':    print('-----------存在的属性：__getattribute__------------\n')    print('-----------不存在的属性__getattribute__ ---》 __getattr__------------\n')    print('----------类直接访问成员（实现了__get__的类）都会先经过__get__函数-------------\n')    print('-----------对象直接访问成员（实现了__get__的类）都会先经过__get__函数------------\n')    print('----------类把直接访问成员（实现了__get__的类）中存在的属性：__get__ --> __getattribute__  -------------\n')    print('-----------对象直接访问成员（实现了__get__的类）中不存在的属性：__get__ --> __getattribute__ -->__getattr__ ------------\n')``` 
 [https://blog.csdn.net/Windgs_YF/article/details/53422478?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control](https://blog.csdn.net/Windgs_YF/article/details/53422478?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control) 
 [https://blog.csdn.net/Windgs_YF/article/details/53422478?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control](https://blog.csdn.net/Windgs_YF/article/details/53422478?utm_medium=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-BlogCommendFromBaidu-15.control)
````
