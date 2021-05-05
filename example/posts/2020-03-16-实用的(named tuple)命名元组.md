---
title: 实用的(named tuple)命名元组
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

> Python 的创始人 Guido van Rossum 曾经提过一个建议：“不要过度的自己去构建数据结构，尽量去使用命名元组 (named tuple) 而不是对象，尽量使用简单的属性域，因为内置数据类型是你最好的朋友。”

那么什么是命名元组呢，要解释什么是命名元组时我觉得很有必要说明下为什么我们需要它以及它可以提供什么功能，那就自然明白什么是命名元组了。

我们知道在一些编程语言里，都有 struct 结构体这类数据类型，当我们对结构体对象进行赋值或者取值的时候可以直接使用**"."**运算符来操作。

但是 Python 里是否也可以用自带的数据类型做到这样的效果呢？

在回答这个问题之前，我想先用一个例子再说的更清楚一些，假设我有一堆庞大的多类型数据，为了节省空间我使用元组来进行保存，但是要知道数据一旦保存为元组后，访问其中的内容只能通过下标索引的方式去访问，数据一旦多了通过记住每个下标那就会显得相当困难，到底是第\[3]下标还是第\[9]下标呢，于是**命名元组 (named tuple)**就出现了，通过命名元组我们就可以直接使用**"."**运算符跟上对应的属性名获得对应的内容。

* * *

named tuple 语法规则定义的格式如下：

**collections.namedtuple(typename, field_names, \*, rename=False, defaults=None, module=None)**

**typename**: 定义这个元组的名称

**field_names**: 这个元组元素的名称，可以有多种表达方式，如：'name1 name2' 或'name1, name2' 或 \['name1', 'name2']

**defaults=None**: 默认值设置可以是 None 或者是设置一个迭代的默认值。

**module**: 如果有定义 module，那么设置 module 参数后，命名元组的\_\_module\_\_的属性就是被设定的值。

**rename=False**: 如果元素名称中含有 python 的关键字，或者有重复元素名称出现时，设置为 rename=True 时，那些不符合规则的元素名称就会被系统更改为下划线加数字。比如： `['abc', 'def', 'ghi', 'abc']`会被替换为`['abc', '_1', 'ghi', '_3']`因为，其中 def 被认为是 python 保留关键字，而另一个 abc 重复出现了第二次，所以都被替换为了'\_1'，'\_3'。

* * *

下面这个例子，让我们看看如何定义和使用一个命名元组。

```null
from collections import namedtuple  

product = namedtuple('mobile_product', 'name, color, price')  

obj = product(name = 'iPhone', color = 'gray', price = 7000)  

print("Name:{}, Color:{}, Price:{}".format(obj.name, obj.color, obj.price))



```

named tuple 还有一个非常好的一点是它与 tuple 是完全兼容的。也就是说，我们依然可以用索引去访问一个 named tuple。

```null
print("Name:{}, Color:{}, Price:{}".format(obj[0], obj[1], obj[2]))



```

所以，named tuple 比普通 tuple 具有更好的可读性，可以使代码更易于维护。同时与字典相比，又更加的轻量和高效。但是有一点需要注意，既然都叫元组，那么元组的特性就是不可变，自然在 named tuple 中的属性也都是不可变的。任何尝试改变其属性值的操作都是非法的。

```null
from collections import namedtuple

product = namedtuple('mobile_product', 'name, color, price')  
obj = product(name = 'iPhone', color = 'gray', price = 7000)  
obj.name = 'HUAWEI'




```

因为 named tuple 命名元组除了拥有继承自 tuple 元组的所有方法之外，在 Python 3.7 版本中，还提供了额外的三个方法和两个属性，为了防止命名冲突，这些方法都会以单个下划线开头，分别是: **\_make(iterable)**、**\_replace(\*\*kwargs)**、**\_asdict()**、**\_fields**、**\_fields_defaults**。

前面有提到无论元组还是命名元组都是不可以修改值的，如果实在想要更改属性值时怎么办？那就可以使用**\_replace(\*\*kwargs)**方法，根据传入的关键词参数，替换 named tuple 的相关参数，然后返回一个新的 named tuple。

下面的例子中，我们使用\_replace() 方法成功修改了两个参数值。

```null
from collections import namedtuple

product = namedtuple('mobile_product', 'name, color, price')  
obj = product(name = 'iPhone', color = 'gray', price = 7000)  

obj._replace(name = 'HUAWEI', price = 8000)



```

我们还可以使用\_make() 方法批量给 named tuple 的元素赋值。

```null
from collections import namedtuple

product = namedtuple('mobile_product', 'name, color, price')  
value = ['iPhone', 'gray', 7000]  

obj = product._make(value)  
obj



```

**引申：使用场景**

named tuple 最常用的还是在处理 csv 或者数据库返回的数据上。比如使用**\_make()**方法配合**map()**函数式编程可以快速从 csv 文件中倒入到我们的命名元组结构中。

```null
from collections import namedtuple  
import csv

product = namedtuple('mobile_product', 'name, color, price')

for prds in map(product._make, csv.reader(open("products.csv", "rb"))):  
    print(prds.name, prds.color, prds, price)
```

分析下上面这个场景案例是如何执行的，我们都知道 map() 是一个高阶函数，它的参数可以接受一个 function 和 list 也就是 map(function, list) 形式，它可以把每个 list 里的元素放入 function 中去执行。

那么在上面这个例子中，我们的 list 就是从 csv 里读取所有数据，并把这些数据传给我们的 function 也就是 product.\_make，让他以迭代的方式传值给命名元组中的每个元素。这种方法在处理大批量数据时定义数据结构时非常有用。

### 另一个批量的例子

```python
# 注意order_detail字典中不能出现以下划线命名的key
cc = namedtuple('Order_info', order_detail.keys())(*order_detail.values())
cc.order_no
```

 [http://anders.wang/namedtuple/](http://anders.wang/namedtuple/)
