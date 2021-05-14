---
title: python3 操作 redis List(列表) 实例 详解_dangsh_的博客-CSDN博客
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

没有安装 redis 的话可以看我另一篇 blog，有资源和方法

**首先先看一下 python3 操作 redis 都有哪些命令**

1.  lrange(key , start , stop)
2.  lpush(key , value)
3.  rpush(key , value)
4.  lpop(key)
5.  rpop(key)
6.  blpop(key)
7.  brpop(key)
8.  brpoplpush(source,destination,timeout)
9.  lindex(key,index)
10. linsert(key,before|after,privot,value)
11. llen(key)
12. lpushx(key)
13. lrem(key , value , count)
14. lset(key , index , value)
15. ltrim(key , start , stop)
16. rpoplpush(source , destination)
17. rpushx(key , value)

有 dalao 想直接看完整代码请移步**github**：  
[https://github.com/dangsh/pythonPra/blob/master/redisGit/redisTest.py](https://github.com/dangsh/pythonPra/blob/master/redisGit/redisTest.py)

## **下面是具体例子详解和代码：**

**①lrange(key , start , stop)**  
返回列表 key 中指定区间内的元素，区间以偏移量 start 和 stop 指定。  
下标 (index) 参数 start 和 stop 都以 0 为底，也就是说，以 0 表示列表的第一个元素，以 1 表示列表的第二个元素，以此类推。

````python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.lpush("0",1,2,3,4) 
print(r.lrange("0" , 0 , -1))```

**②lpush(key , value)**  
将一个或多个值 value 插入到列表 key 的表头  
如果有多个 value 值，那么各个 value 值按从左到右的顺序依次插入到表头  
如果 key 不存在，一个空列表会被创建并执行 LPUSH 操作  
当 key 存在但不是列表类型时，返回一个错误

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.lpush("1",1) 
print(r.lrange("1" , 0 , -1)) 
r.lpush("1",1,2,3,4)
print(r.lrange("1" , 0 , -1))```

**③rpush(key , value)**  
将一个或多个值 value 插入到列表 key 的表尾(最右边)。  
如果有多个 value 值，那么各个 value 值按从左到右的顺序依次插入到表尾  
如果 key 不存在，一个空列表会被创建并执行 RPUSH 操作。  
当 key 存在但不是列表类型时，返回一个错误。

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("2",1) 
print(r.lrange("2" , 0 , -1)) 
r.rpush("2",1,2,3,4)
print(r.lrange("2" , 0 , -1))```

**④lpop(key)**  
移除并返回列表 key 的头元素。

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.lpush("3",1,2,3,4)
print(r.lrange("3" , 0 , -1)) 
r.lpop("3")
print(r.lrange("3" , 0 , -1))```

**⑤rpop(key)**  
移除并返回列表 key 的尾元素。

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.lpush("4",1,2,3,4)
print(r.lrange("4" , 0 , -1)) 
r.rpop("4")
print(r.lrange("4" , 0 , -1))```

**⑥blpop(key)**  
Blpop 命令移出并获取列表的第一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。  
如果列表为空，返回一个 None 。 否则，返回一个含有两个元素的列表，第一个元素是被弹出元素所属的 key ，第二个元素是被弹出元素的值。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("6",1,2,3,4,4,5,6)
print(r.blpop("6"))
print(r.blpop("6"))
print(r.blpop("6"))
print(r.blpop("100" , timeout=2))
print(r.lrange("6" , 0 , -1)) ```

**⑦brpop(key)**  
Brpop 命令移出并获取列表的最后一个元素， 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。  
假如在指定时间内没有任何元素被弹出，则返回一个None 和等待时长。 反之，返回一个含有两个元素的列表，第一个元素是被弹出元素所属的 key ，第二个元素是被弹出元素的值。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("7",1,2,3,4,5,6,)     
print(r.lrange("7" , 0 , -1)) 
print(r.brpop("7"))     
print(r.brpop("7"))     
print(r.brpop("7"))      
print(r.brpop("101",timeout=2))      
print(r.lrange("7" , 0 , -1)) ```

**⑧brpoplpush(source,destination,timeout)**  
命令从列表中弹出一个值，将弹出的元素插入到另外一个列表中并返回它； 如果列表没有元素会阻塞列表直到等待超时或发现可弹出元素为止。  
假如在指定时间内没有任何元素被弹出，则返回一个 None 和等待时长。 反之，返回一个含有两个元素的列表，第一个元素是被弹出元素的值，第二个元素是等待时长。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("8",1,2,3)
r.rpush("88",4,5,6)
print(r.lrange("8" , 0 , -1)) 
print(r.lrange("88" , 0 , -1)) 
print(r.brpoplpush(src="8",dst="88",timeout=2))  
print(r.brpoplpush(src="44",dst="22",timeout=2))  
print(r.lrange("8" , 0 , -1)) 
print(r.lrange("88" , 0 , -1)) ```

**⑨lindex(key,index)**

通过索引获取列表中的元素。你也可以使用负数下标，以 -1 表示列表的最后一个元素

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("9",1,2,3)
print(r.lrange("9" , 0 , -1)) 
print(r.lindex("9",0))        
print(r.lindex("9",1))        
print(r.lindex("9",2))        
print(r.lindex("9",3))        
print(r.lindex("9",-1))        
print(r.lrange("9" , 0 , -1)) ```

**⑩linsert(key,before|after,privot,value)**  
用于在列表的元素前或者后插入元素。  
当指定元素不存在于列表中时，不执行任何操作。 当列表不存在时，被视为空列表，不执行任何操作。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("10",1,2,3)
print(r.lrange("10" , 0 , -1)) #打印列表"10"的全部内容 
r.linsert("10" , "BEFORE" , "2" , 10)
print(r.lrange("10" , 0 , -1)) #结果 ['1', '10', '2', '3']

r.rpush("100",1,2,3)
r.linsert("100" , "AFTER" , "2" , 10)
print(r.lrange("100" , 0 , -1)) #结果 ['1', '2', '10', '3']```

**①①llen(key)**  
返回列表的长度。 如果列表 key 不存在，则 key 被解释为一个空列表，返回 0 。 如果 key 不是列表类型，返回一个错误。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("11",1,2,3)
print(r.lrange("11" , 0 , -1)) 
print(r.llen("11"))  ```

**①②lpushx(key)**  
将一个或多个值插入到已存在的列表头部，列表不存在时操作无效。  
和lpush的区别是lpushx在列表不存在时操作无效，而lpush会创建一个列表

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("12" , 1,2,3)
r.rpush("122" , 1,2,3)
print(r.lrange("12" , 0 , -1)) #结果为 ['1', '2', '3']
print(r.lrange("122" , 0 , -1)) #结果为 ['1', '2', '3']
r.lpush("123" , 1)
r.lpushx("1223" , 1)
print(r.lrange("123" , 0 , -1)) #结果为 ['1']
print(r.lrange("1223" , 0 , -1)) #结果为 []```

**①③lrem(key , value , count)**  
根据参数 COUNT 的值，移除列表中与参数 VALUE 相等的元素。  
COUNT 的值可以是以下几种：  
count > 0 : 从表头开始向表尾搜索，移除与 VALUE 相等的元素，数量为 COUNT 。  
count < 0 : 从表尾开始向表头搜索，移除与 VALUE 相等的元素，数量为 COUNT 的绝对值。  
count = 0 : 移除表中所有与 VALUE 相等的值。  
返回被移除元素的数量。 列表不存在时返回 0 。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("13" , 'a','b','b','c','d','b')
print(r.lrange("13" , 0 , -1)) #结果为['a', 'b', 'b', 'c', 'd', 'b']
r.lrem("13" , "b" , 2)
print(r.lrange("13" , 0 , -1)) #结果为['a', 'c', 'd', 'b']

r.rpush("133" , 'a','b','b','c','d','b')
print(r.lrange("133" , 0 , -1)) #结果为['a', 'b', 'b', 'c', 'd', 'b'] 
r.lrem("133" , "b" , -2)
print(r.lrange("133" , 0 , -1)) #结果为['a', 'b', 'c', 'd']```

**①④lset(key , index , value)**  
将列表 key 下标为 index 的元素的值设置为 value 。  
当 index 参数超出范围，或对一个空列表( key 不存在)进行 LSET 时，返回一个错误。

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("14" , 1,2,3,4)
print(r.lrange("14" , 0 , -1)) #打印列表"14"的全部内容
r.lset("14",1,9)
print(r.lrange("14" , 0 , -1)) #结果为 ['1', '9', '3', '4']```

**①⑤ltrim(key , start , stop)**  
对一个列表进行修剪(trim)，就是说，让列表只保留指定区间内的元素，不在指定区间之内的元素都将被删除。  
举个例子，执行命令 LTRIM list 0 2 ，表示只保留列表 list 的前三个元素，其余元素全部删除。  
下标(index)参数 start 和 stop 都以 0 为底，也就是说，以 0 表示列表的第一个元素，以 1 表示列表的第二个元素，以此类推。  
你也可以使用负数下标，以 -1 表示列表的最后一个元素， -2 表示列表的倒数第二个元素，以此类推。  
当 key 不是列表类型时，返回一个错误。

```python
import redis
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("15" , 1,2,3,4)
print(r.lrange("15" , 0 , -1)) 
r.ltrim("15",0,1)
print(r.lrange("15" , 0 , -1)) ```

**①⑥rpoplpush(source , destination)**  
将列表 source 中的最后一个元素(尾元素)弹出，并返回给客户端。  
将 source 弹出的元素插入到列表 destination ，作为 destination 列表的的头元素。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
r.rpush("16",1,2,3)
r.rpush("166",4,5,6)
print(r.lrange("16" , 0 , -1)) # ['1', '2', '3'] 
print(r.lrange("166" , 0 , -1)) # ['4', '5', '6'] 
print(r.rpoplpush(src="16",dst="166"))  #输出的结果是3
print(r.lrange("16" , 0 , -1)) # ['1', '2'] 
print(r.lrange("166" , 0 , -1)) # ['3', '4', '5', '6']```

**①⑦rpushx(key , value)**  
将值 value 插入到列表 key 的表尾，当且仅当 key 存在并且是一个列表。  
和 RPUSH 命令相反，当 key 不存在时， RPUSHX 命令什么也不做。

```python
import redis 
r = redis.Redis(host='localhost' , port='6379' , db=6 ,decode_responses=True)
# for i in range(10):
#     r.lpop("17")
#     r.lpop("177")
#     r.lpop("1777")
r.rpush("17" , 1,2,3)
r.rpush("177" , 1,2,3)
print(r.lrange("17" , 0 , -1)) #结果为 ['1', '2', '3']
print(r.lrange("177" , 0 , -1)) #结果为 ['1', '2', '3']
r.rpush("177" , 4)
r.rpushx("1777" , 4)
print(r.lrange("177" , 0 , -1)) #结果为 ['1', '2', '3', '4']
print(r.lrange("1777" , 0 , -1)) #结果为 []```

结束啦~ 之后我会更新redis其它数据类型的操作  
再贴一个完整代码的地址  
[https://github.com/dangsh/pythonPra/blob/master/redisGit/redisTest.py](https://github.com/dangsh/pythonPra/blob/master/redisGit/redisTest.py) 
 [https://blog.csdn.net/dangsh_/article/details/79221328](https://blog.csdn.net/dangsh_/article/details/79221328) 
 [https://blog.csdn.net/dangsh_/article/details/79221328](https://blog.csdn.net/dangsh_/article/details/79221328)
````
