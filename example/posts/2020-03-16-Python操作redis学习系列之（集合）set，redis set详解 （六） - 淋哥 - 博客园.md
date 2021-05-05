---
title: Python操作redis学习系列之（集合）set，redis set详解 （六） - 淋哥 - 博客园
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

# -\*- coding: utf-8 -\*-

import redis
r \\= redis.Redis(host="126.56.74.190",port=639,password="66666666")

1. Sadd 命令将一个或多个成员元素加入到集合中，已经存在于集合的成员元素将被忽略。  
假如集合 key 不存在，则创建一个只包含添加的元素作成员的集合。当集合 key 不是集合类型时，返回一个错误。

print r.sadd("1",1)     #输出的结果是 1
print r.sadd("1",2)     #输出的结果是 1
print r.sadd("1",2)     #因为 2 已经存在，不能再次田间，所以输出的结果是 0
print r.sadd("1",3,4)   #输出的结果是 2
print r.sinter("1")     #输出的结果是 set(\['1', '3', '2', '4'])

2.Scard 命令返回集合中元素的数量。集合的数量。 当集合 key 不存在时，返回 0 。

print r.sadd("2",1)         #输出的结果是 1
print r.sadd("2",2,3,4,5)   #输出的结果是 1
print r.scard("2")          #输出的结果是 5

3.Sdiff 命令返回给定集合之间的差集。不存在的集合 key 将视为空集。

print r.sadd("31",1,2,3,4,5,6)      #输出的结果是 6
print r.sadd("32",4,5,6,7,8,9)      #输出的结果是 6
print r.sdiff(31,32)            #输出的结果是 set(\['1', '3', '2'])
print r.sdiff(32,31)            #输出的结果是 set(\['9', '8', '7'])
print r.sdiff(31,31)            #输出的结果是 set(\[])

4.Sdiffstore 命令将给定集合之间的差集存储在指定的集合中。如果指定的集合 key 已存在，则会被覆盖。

print r.sadd("41",1,2,3,4,5,6)      #输出的结果是 6
print r.sadd("42",4,5,6,7,8,9)      #输出的结果是 6
print r.sadd("43",0)                #输出的结果是 1
print r.sdiffstore("43","41","42")  #输出的结果是 3
print r.sinter("43")                 #输出的结果是 set(\['1', '3', '2'])

5.Sinter 命令返回给定所有给定集合的交集。 不存在的集合 key 被视为空集。 当给定集合当中有一个空集时，结果也为空集 (根据集合运算定律)。

![](https://common.cnblogs.com/images/copycode.gif)

print r.sadd("51",3,4,5,6)      #输出的结果是 4
print r.sadd("52",1,2,3,4)      #输出的结果是 4
print r.sinter(51,52)           #输出的结果是 set(\['3', '4'])
print r.sadd("53",1,2,3,4,5,6)  #输出的结果是 6
print r.sadd("54",3,4,5,6,7,8,9)# 输出的结果是 7
print r.sinter(53,54)           #输出的结果是 set(\['3', '5', '4', '6'])
print r.sinter(53,56)           #输出的结果是 set(\[])

![](https://common.cnblogs.com/images/copycode.gif)

6.Sinterstore 命令将给定集合之间的交集存储在指定的集合中。如果指定的集合已经存在，则将其覆盖。

print r.sadd("61",3,4,5,6)      #输出的结果是 4
print r.sadd("62",1,2,3,4)      #输出的结果是 4
print r.sadd("63",0)            #输出的结果是 1
print r.sinterstore(63,61,62)   #输出的结果是 2
print r.sinter(63)              #输出的结果是 set(\['3', '4'])

7.Sismember 命令判断成员元素是否是集合的成员。  
如果成员元素是集合的成员，返回 1 。 如果成员元素不是集合的成员，或 key 不存在，返回 0 。

print r.sadd("71",1,2,3,4,5,6)   #输出的结果是 6
print r.sismember("71",1)        #输出的结果是 True
print r.sismember("71",2)        #输出的结果是 True
print r.sismember("71",7)        #输出的结果是 False
print r.sismember("71",8)        #输出的结果是 False

8.Smembers 命令返回集合中的所有的成员。 不存在的集合 key 被视为空集合。

print r.sadd("81",1,2,3,4,5,6)   #输出的结果是 6
print r.smembers(81)             #输出的结果是 set(\['1', '3', '2', '5', '4', '6'])
print r.smembers(82)             #输出的结果是 set(\[])

9.Smove 命令将指定成员 member 元素从 source 集合移动到 destination 集合。  
SMOVE 是原子性操作。  
如果 source 集合不存在或不包含指定的 member 元素，则 SMOVE 命令不执行任何操作，仅返回 False 。否则， member 元素从 source 集合中被移除，并添加到 destination 集合中去。  
当 destination 集合已经包含 member 元素时， SMOVE 命令只是简单地将 source 集合中的 member 元素删除。  
当 source 或 destination 不是集合类型时，返回一个错误。  
如果成员元素被成功移除，返回 True。 如果成员元素不是 source 集合的成员，并且没有任何操作对 destination 集合执行，那么返回 False

![](https://common.cnblogs.com/images/copycode.gif)

print r.sadd("91",1,2,)     #输出的结果是 2
print r.sadd("92",3,4,)     #输出的结果是 2
print r.smove(91,92,1)      #把 91 中的 1 移动到 92 中去，输出的结果是 True
print r.smembers("91")      #输出的结果是 set(\['2'])
print r.smembers("92")      #输出的结果是 set(\['1', '3', '4'])
print r.smove(91,92,5)      #91 不存在 5，输出的结果是 False
print r.smembers("91")      #输出的结果是 set(\['2'])
print r.smembers("92")      #输出的结果是 set(\['1', '3', '4'])

![](https://common.cnblogs.com/images/copycode.gif)

10. Spop 命令用于移除并返回集合中的一个随机元素。

print r.sadd("10",1,2,3,4,5,6)  #输出的结果是 6
print r.spop("10")              #输出的结果是 3
print r.smembers("10")          #输出的结果是 set(\['1', '2', '5', '4', '6'])
print r.spop("10")              #输出的结果是 1
print r.smembers("10")          #输出的结果是 set(\['2', '5', '4', '6'])

11.Srandmember 命令用于返回集合中的一个随机元素。

从 Redis 2.6 版本开始， Srandmember 命令接受可选的 count 参数：  
如果 count 为正数，且小于集合基数，那么命令返回一个包含 count 个元素的数组，数组中的元素各不相同。如果 count 大于等于集合基数，那么返回整个集合。  
如果 count 为负数，那么命令返回一个数组，数组中的元素可能会重复出现多次，而数组的长度为 count 的绝对值。  
该操作和 SPOP 相似，但 SPOP 将随机元素从集合中移除并返回，而 Srandmember 则仅仅返回随机元素，而不对集合进行任何改动。

print r.sadd("11",1,2,3,4,5,6)  #输出的结果是 6
print r.srandmember(11)         #输出的结果是 4
print r.smembers(11)            #输出的结果是 set(\['1', '3', '2', '5', '4', '6'])
print r.srandmember(11,3)         #输出的结果是\['6', '3', '1']
print r.smembers(11)            #输出的结果是 set(\['1', '3', '2', '5', '4', '6'])

12. Srem 命令用于移除集合中的一个或多个成员元素，不存在的成员元素会被忽略。  
当 key 不是集合类型，返回一个错误。  
被成功移除的元素的数量，不包括被忽略的元素。

print r.sadd("12",1,2,3,4,5,6,7)    #输出的结果是 7
print r.srem("12",1)                #输出的结果是 1
print r.smembers("12")              #输出的结果是 set(\['3', '2', '5', '4', '7', '6'])
print r.srem("12",8)                #输出的结果是 0
print r.smembers("12")              #输出的结果是 set(\['3', '2', '5', '4', '7', '6'])

 13.Sunion 命令返回给定集合的并集。不存在的集合 key 被视为空集。

print r.sadd("131",1,2,3,4,5,6,7)    #输出的结果是 7
print r.sadd("132",0,1,2,7,8,9)      #输出的结果是 6
print r.sunion(131,132)             #输出的结果是 set(\['1', '0', '3', '2', '5', '4', '7', '6', '9', '8'])
print r.sunion(131,134)             #输出的结果是 set(\['1', '3', '2', '5', '4', '7', '6'])

 14.Sunionstore 命令将给定集合的并集存储在指定的集合 destination 中。

print r.sadd("141",1,2,3,4,5,6,7)    #输出的结果是 7
print r.sadd("142",0,1,2,3,4)        #输出的结果是 5
print r.sunionstore(143,141,142)     #输出的结果是 8
print r.smembers(143)                #输出的结果是 set(\['1', '0', '3', '2', '5', '4', '7', '6'])

 15.Sscan 命令用于迭代集合键中的元素。

print r.sadd("151",1,2,3,4,5,6,7)           #输出的结果是 7
print r.sscan(151,cursor=2,match=1,count=1) #输出的结果是 (0L, \['1'])

[redis 安装和配置（一）](http://www.cnblogs.com/xuchunlin/p/6676308.html) 

[redis 学习 （key）键，Python 操作 redis 键 （二）](http://www.cnblogs.com/xuchunlin/p/7061524.html) 

[Python 操作 redis 字符串 (String) 详解 (三) ](http://www.cnblogs.com/xuchunlin/p/7062065.html)  

[Python 操作 redis 系列以 哈希 (Hash) 命令详解（四）](http://www.cnblogs.com/xuchunlin/p/7064860.html) 

[Python 操作 redis 系列之 列表（list） (五)   ](http://www.cnblogs.com/xuchunlin/p/7067154.html)

[Python 操作 redis 学习系列之（集合）set，redis set 详解 （六）](http://www.cnblogs.com/xuchunlin/p/7070267.html) 

[python 操作 redis 之——有序集合 (sorted set) （七）](https://www.cnblogs.com/xuchunlin/p/7097255.html) 

[python 操作 redis 之——HyperLogLog （八）](http://www.cnblogs.com/xuchunlin/p/7097272.html)

[redis.windows.conf 各项配置参数介绍 （九）](http://www.cnblogs.com/xuchunlin/p/7097729.html) 

附录： 字符串命令  
　　_Redis 集合 (Set) 命令_ 
 [https://www.cnblogs.com/xuchunlin/p/7070267.html](https://www.cnblogs.com/xuchunlin/p/7070267.html) 
 [https://www.cnblogs.com/xuchunlin/p/7070267.html](https://www.cnblogs.com/xuchunlin/p/7070267.html)
