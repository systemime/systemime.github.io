---
title: Redis使用字符串和hash存储JSON，那个更高效？_程序员学编程 的专栏-CSDN博客
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

[程序员学编程](https://blog.csdn.net/hjxzb) 2020-12-20 09:23:46 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/articleReadEyes.png)
 513 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect.png)
 收藏 

版权声明：本文为博主原创文章，遵循 [CC 4.0 BY-SA](http://creativecommons.org/licenses/by-sa/4.0/) 版权协议，转载请附上原文出处链接和本声明。

最近在排查一个线上问题，发现 redis 使用了一个 hash key 里面存储了 600w 的 field，为啥这么多就是因为他把一个结构体中的字段分成了多个 field 存储。下面来看看到底应该怎么设计比较合理。

## 一、问题

1.  一种使用简单的字符串键和值。  
    键：用户，值：payload（整个 JSON，可以为 100-200 KB）

```shell
SET user:1 payload

```

2.  使用哈希

```shell
HSET user:1 username "someone" 
HSET user:1 location "NY" 
HSET user:1 bio "STRING WITH OVER 100 lines"

```

请记住，如果使用哈希，则值长度是不可预测的。它们并不都是短的，例如上面的 bio 示例。哪个内存效率更高？使用字符串键和值，还是使用哈希？

## 二、讨论

1.  将整个对象作为 JSON 编码的字符串存储在单个键中，并使用一组（或列表，如果合适的话）跟踪所有对象。例如：

```shell
INCR id:users
SET user:{id} '{"name":"Fred","age":25}'
SADD users {id}

```

一般来说，在大多数情况下，这可能是最好的方法。如果对象中有很多字段，一个对象不会与其他对象嵌套，并且您一次只能访问一小部分字段，那么选择选项 1 可能不是很好。

**优点**：被认为是 “良好实践”。每个对象都是具有用户信息的 Redis key。JSON 解析速度很快，尤其是当您需要一次访问此 Object 的多个字段时。

**缺点**：当您只需要访问一个字段时，速度较慢。

2.  将每个对象的属性存储在 Redis 哈希中。

```shell
INCR id:users
HMSET user:{id} name "Fred" age 25
SADD users {id}

```

**优点**：被认为是 “良好实践”。每个对象都是具有用户信息的 Redis key。无需解析 JSON 字符串。

**缺点**：当您需要访问对象中的所有 / 大多数字段时，速度可能会变慢。同样，嵌套对象（对象内的对象）也无法轻松存储。

3.  将每个对象作为 JSON 字符串存储在 Redis 哈希中。

```shell
INCR id:users
HMSET users {id} '{"name":"Fred","age":25}'

```

这使您可以进行合并，并且仅使用两个键，而不是很多键。明显的缺点是您不能在每个用户对象上设置 TTL（以及其他内容），因为它只是 Redis 哈希中的一个字段，而不是具有用户信息的 Redis key。

**优点**：JSON 解析速度很快，尤其是当您需要一次访问此 Object 的多个字段时。减少主键名称空间的 “污染”。

**缺点**：当您有很多对象时，内存使用量与＃1 差不多。当您只需要访问单个字段时，速度比＃2 慢。可能不被视为 “良好做法”。

4.  将每个对象的每个属性存储在专用 key 中。

```shell
INCR id:users
SET user:{id}:name "Fred"
SET user:{id}:age 25
SADD users {id}

```

根据上面的解释，_几乎永远不会_选择此方案（除非 Object 的属性需要具有特定的[TTL](http://redis.io/commands/expire)或其他内容）。

**优点**：对象属性是具有用户信息的 Redis key，对于您的应用程序来说可能并不算过大。

**缺点**：速度慢，占用更多内存，并且不被视为 “最佳实践”。主键名称空间受到很多污染。

## 三、总结

方案 4 通常不是首选。方案 1 和 2 非常相似，而且都很常见。我更喜欢选项 1（通常来说），因为它允许您存储更复杂的对象（具有多层嵌套等）。当您_真正关心_不污染主键名称空间时，可以使用方案 3。 
 [https://blog.csdn.net/hjxzb/article/details/111413801](https://blog.csdn.net/hjxzb/article/details/111413801) 
 [https://blog.csdn.net/hjxzb/article/details/111413801](https://blog.csdn.net/hjxzb/article/details/111413801)
