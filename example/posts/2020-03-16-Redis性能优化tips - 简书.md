---
title: Redis性能优化tips - 简书
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

[![](https://upload.jianshu.io/users/upload_avatars/1514374/ba306f762f33.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96/format/webp)
](https://www.jianshu.com/u/2285873d6fc4)

42018.03.01 15:15:51 字数 3,824 阅读 6,037

读完了[Redis 实战](https://link.jianshu.com/?t=https%3A%2F%2Fbook.douban.com%2Fsubject%2F26612779%2F)，感觉收获还是蛮多的。像往常那样，读完就想将书束之高阁。这几天总感觉差点什么，于是又翻了一下这本书，打算记录书上和自己知道的关于 Redis 优化的小知识点。

* * *

## 数据持久化

-   选择恰当的持久化方式。Redis 提供`RDB`和`AOF`两种持久化方式。用户需要根据实际场景对两种持久化方式进行考量和选择。  
    `RDB`会在一定时间间隔内一次性将内存中的所有数据刷到磁盘上，非增量。它的一个主要缺点是如果 Redis 宕机了，那么可能会造成部分数据丢失，丢失的数据两和`RDB`持久化的时间间隔有关。此外，如果数据集非常大，Redis 在创建子进程时可能会消耗相对较长的时间，这期间客户端请求都会被阻塞。这种情况下我们可以关闭自动保存，通过手动发送`SAVE`或者`BGSAVE`命令来控制停顿出现的时间。由于`SAVE`命令不需要创建子进程，从而避免了与子进程的资源竞争，因此它比`BGSAVE`速度更快。手动生成快照可以选择在线用户很少的情况下执行，比如使用脚本在凌晨三点执行`SAVE`命令。  
    从上述内容可以看出，`RDB`适用于即使丢失部分数据也不会造成问题的场景。同时我们需要注意快照是否生成得过于频繁或者稀少。  
    `AOF`持久化会将被执行的命令追加到`AOF`文件末尾。在`redis.conf`中该功能默认是关闭的，设置`appendonly yes`以开启该功能。这种方式会对磁盘进行大量写入，因此`Redis`处理命令的速度会受到硬盘性能的限制。并且`AOF`文件通常比`RDB`文件更大，数据恢复速度比 RDB 慢，性能消耗也比`RDB`高。由于它记录的是实际执行的命令，所以也易读。为了兼顾写入性能和数据安全，可以在配置文件设置`appendfsysnc everysec`。并不推荐`appendfsync no`选项，因为这种方式是由操作系统决定何时对 AOF 文件进行写入。在缓冲区被待写入硬盘的数据填满时，可能造成 Redis 的写入操作被阻塞，严重影响性能。
-   重写`AOF`文件。如果用户开启了`AOF`功能，Redis 运行时间越长，｀AOF`文件也会越来越大。用户可以发送`BGREWRITEAOF`重写 AOF 文件，它会移除 AOF 文件中的冗余命令以此来减小`AOF`文件的体积。由于 AOF 文件重写会用到子进程，因此也存在`BGSAVE\`命令持久化快照时因为创建子进程而导致的性能问题和内存占用问题。除了使用命令重写 AOF 文件，也可以在配置文件中配置，以让 Redis 自动执行重写命令。

        ＃当aof文件体积大于64mb且比上次重写之后的体积增大了至少一倍
        auto-aof-rewrite-percentage 100 
        auto-aof-rewrite-min-size 64mb 

## 内存优化

-   设置_maxmemory_。设置 Redis 使用的最大物理内存，即 Redis 在占用_maxmemory_大小的内存之后就开始拒绝后续的写入请求，该参数可以确保 Redis 因为使用了大量内存严重影响速度或者发生_OOM_。此外，可以使用`info`命令查看 Redis 占用的内存及其它信息。
-   让键名保持简短。键的长度越长，`Redis`需要存储的数据也就越多
-   使用短结构。这节主要谈谈 Redis 的_list_、_hash_、_set_、_zset_这四种数据结构的存储优化。  
    在_Redis3.2_之前，如果列表、散列或者有序集合的长度或者体积较小，_Redis_会选择一种名为_ziplist_的数据结构来存储它们。该结构是列表、散列和有序集合三种不同类型的对象的一种非结构化表示，与 Redis 在通常情况下使用双向链表来表示列表、使用散列表示散列、使用散列加跳跃表表示有序集合相比，它更加紧凑，避免了存储额外的指针和元数据（比如字符串值的剩余可用空间和结束符 "\\0"）。但是压缩列表需要在存储的时候进行序列化，读取的时候进行反序列化。以散列为例，在`redis.conf`中，可以进行如下设置

    > hash-max-ziplist-entries 512  
    > hash-max-ziplist-value 64

    `entries`选项说明允许被编码为_ziplist_的最大元素数量，`value`表示压缩列表每个节点的最大体积是多少个字节。如果任意一个条件不满足，则压缩列表会退化成相应的常规结构。这样做的原因是，当压缩列表的体积越来越大时，操作这些数据结构的速度也会越来越慢，特别是当需要扫描整个列表的时候，因为 Redis 需要解码很多单独的节点。那么上述值各取多少合适呢？合理的做法是将压缩列表长度限制在 500~2000 个元素之内，并且每个元素体积在 128 字节之内。_Redis 实战_推荐的做法是将压缩列表长度限制在**1024**个元素之内，并且每个元素体积不超过**64**字节。这类参数可能还得由应用的实际场景来定。此外，我们可以使用`DEBUG OBJECT`命令来查看某个存储的数据使用了何种数据结构及其它一些重要信息。  
    在_Redis3.2_及以后，列表的内部实现变成了`quicklist`而非 ziplist 或者传统的双端链表。官方定义是`A doubly linked list of ziplists`，即由_ziplist_组成的双向链表。quicklist 这样设计的原因大概是一个空间和时间的折中：(1) 双向链表便于在表的两端进行 push 和 pop 操作，但是它的内存开销比较大。首先，它在每个节点上除了要保存数据之外，还要额外保存两个指针；其次，双向链表的各个节点是单独的内存块，地址不连续，节点多了容易产生内存碎片。(2)ziplist 由于是一整块连续内存，所以存储效率很高。但是，它不利于修改操作，每次数据变动都会引发一次内存的 realloc。特别是当 ziplist 长度很长的时候，一次 realloc 可能会导致大批量的数据拷贝，进一步降低性能。那么到底一个 quicklist 节点包含多长的 ziplist 合适呢？我们从存储效率来分析：(1) 每个 quicklist 节点上的 ziplist 越短，则内存碎片越多。内存碎片多了，有可能在内存中产生很多无法被利用的小碎片，从而降低存储效率。这种情况的极端是每个 quicklist 节点上的 ziplist 只包含一个数据项，这就退化成一个普通的双向链表了。(2) 每个 quicklist 节点上的 ziplist 越长，则为 ziplist 分配大块连续内存空间的难度就越大。有可能出现内存里有很多小块的空闲空间（它们加起来很多），但却找不到一块足够大的空闲空间分配给 ziplist 的情况。这同样会降低存储效率。这种情况的极端是整个 quicklist 只有一个节点，所有的数据项都分配在这仅有的一个节点的 ziplist 里面。这其实退化成一个 ziplist 了。  
    `redis.conf`提供了以下参数来设置`quicklist`的相关属性

        list-max-ziplist-size -2
        list-compress-depth 0 

    `size`参数可取正值和负值，取正的时候表示按照数据项个数来限定每个 quicklist 节点上的 ziplist 长度。取负的时候表示按照数据项大小来限制每个 quicklist 上的 ziplist 长度。计算方式是`2^(abs(n)+1)`, 比如这里`-2`表示_每个 quicklist 节点上的 ziplist 大小不能超过 2^(2+1) 即 8kb_。  
    当列表很长的时候，最容易被访问的很可能是两端的数据，中间的数据被访问的频率比较低（访问起来性能也很低）。如果应用场景符合这个特点，那么 list 还提供了一个选项，能够把中间的数据节点进行压缩，从而进一步节省内存空间。Redis 的配置参数`list-compress-depth`就是用来完成这个设置的。它表示两端不被压缩的元素个数。这里节点个数指 quicklist 双向链表的节点个数，如果一个 quicklist 节点上的 ziplist 被压缩，就是整体被压缩。如果值为 0，则表示两端数据都不被压缩，为 n，则表示两端各 n 个数据不被压缩。  
    关于`ziplist`和`quicklist`细节可以阅读参考链接中的相关文章。

    集合 (_set_) 也有自己的紧凑表示形式。如果集合元素**全是整数**，而这些整数处于平台的有符号范围之内，并且它们的数量又在一定范围内，那么 Redis 会以有序整数数组的方式存储集合，这种方式被成为整数集合 (intset)。`redis.conf`中可以通过

        set-max-intset-entries 512 

    设置该范围。当存储数据个数大于`512`的时候或者存储了其它类型的数据时，它会退化为`hashtable`。在数据量较大的时候，与`ziplist`由于编码解码数据 (如果有对数据移动的操作也会有影响) 主要造成性能瓶颈的原因不同，主要影响`intset`性能的原因是它在执行插入或者删除操作的时候都需要对数据进行移动。因此，需要根据实际情况设置`intset`最大的元素个数。
-   对数据进行分片。比如当单个散列比较大的时候，可以按一定规则 (key+id%shard_num) 对数据进行分片，然后_ziplist_便更不容易退化为`hashtable`，且不会出现编码解码引起的性能问题。

## 扩展读写能力

-   扩展读性能。在`redis.conf`中添加`slaveof host port`即可将其配置为另一台 Redis 服务器的从服务器。注意，在从服务器连接主服务器的时候，从服务器之前的数据会被清空。可以用这种方式建立从服务器树，扩展其读能力。但这种方式并未做故障转移，高可用 Redis 部署方案可以参考[Redis Sentinel](https://www.jianshu.com/p/afb678794a0e),[Redis Cluster](https://link.jianshu.com/?t=http%3A%2F%2Fredis.io%2Ftopics%2Fcluster-tutorial)和[Codis](https://link.jianshu.com/?t=https%3A%2F%2Fgithub.com%2FCodisLabs%2Fcodis)。
-   扩展写性能。(1) 使用集群分片技术，比如 Redis Cluster;(2) 单机上运行多个 Redis 实例。由于 Redis 是单线程设计，在涉及到 cpu bound 的操作的时候，可能速度会大大降低。如果服务器的 cpu、io 资源充足，可以在同一台机器上运行多个 Redis 服务器。

## 应用程序优化

应用程序优化部分主要是客户端和 Redis 交互的一些建议。主要思想是**尽可能减少操作 Redis 往返的通信次数**。

-   使用流水线操作。Redis 支持流水线 (`pipeline`) 操作，其中包括了事务流水线和非事务流水线。Redis 提供了`WATCH`命令与事务搭配使用，实现 CAS 乐观锁的机制。WATCH 的机制是：在事务 EXEC 命令执行时，Redis 会检查被 WATCH 的 key，只有被 WATCH 的 key 从 WATCH 起始时至今没有发生过变更，EXEC 才会被执行。如果 WATCH 的 key 在 WATCH 命令到 EXEC 命令之间发生过变化，则 EXEC 命令会返回失败。使用事务的一个好处是被`MULTI`和`EXEC`包裹的命令在执行时不会被其它客户端打断。但是事务会消耗资源，随着负载不断增加，由`WATCH`、`MULTI`、`EXEC`组成的事务 (CAS) 可能会进行大量重试，严重影响程序性能。  
    如果用户需要向 Redis 发送多个命令，且一个命令的执行结果不会影响另一个命令的输入，那么我们可以使用非事务流水线来代替事务性流水线。非事务流水线主要作用是将待执行的命令一次性全部发送给 Redis，减少来回通信的次数，以此来提升性能。
-   使用 mset、lpush、zadd 等批量操作数据。它的原理同非事务性流行线操作。
-   使用`lua`脚本。**Lua 脚本跟单个 Redis 命令及`MULTI/EXEC`组成的事务一样，都是原子操作**。Redis 采用单线程设计，每次只能执行一个命令，每个单独的命令都是原子的。Lua 脚本有两个好处:(1)减少多个操作通信往返带来的开销 (2) 无需担心由于事务竞争导致的性能开销。
-   尽可能使用时间复杂度为`O(1)`的操作，避免使用复杂度为`O(N)`的操作。避免使用这些 O(N) 命令主要有几个办法：(1) 不要把 List 当做列表使用，仅当做队列来使用;(2) 通过机制严格控制 Hash、Set、Sorted Set 的大小;(3) 可能的话，将排序、并集、交集等操作放在客户端执行;(4) 绝对禁止使用 KEYS 命令;(5) 避免一次性遍历集合类型的所有成员，而应使用`SCAN`类的命令进行分批的，游标式的遍历

    Redis 提供了_Slow Log_功能，可以自动记录耗时较长的命令，`redis.conf`中的配置如下

        #执行时间慢于10000毫秒的命令计入Slow Log
        slowlog-log-slower-than 10000  
        #最大纪录多少条Slow Log
        slowlog-max-len 128 

    使用`SLOWLOG GET n`命令，可以输出最近 n 条慢查询日志。使用`SLOWLOG RESET`命令，可以重置_Slow Log_。

* * *

参考

[Redis 实战](https://link.jianshu.com/?t=https%3A%2F%2Fbook.douban.com%2Fsubject%2F26612779%2F)

[Redis 内部数据结构详解 (4)——ziplist](https://link.jianshu.com/?t=http%3A%2F%2Fzhangtielei.com%2Fposts%2Fblog-redis-ziplist.html)

[Redis 内部数据结构详解 (5)——quicklist](https://link.jianshu.com/?t=http%3A%2F%2Fzhangtielei.com%2Fposts%2Fblog-redis-quicklist.html)

更多精彩内容下载简书 APP

"如果觉得文章对你有用，喜欢和关注走一波如何？"

还没有人赞赏，支持一下

[![](https://upload.jianshu.io/users/upload_avatars/1514374/ba306f762f33.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/100/h/100/format/webp)
](https://www.jianshu.com/u/2285873d6fc4)

[resolvewang](https://www.jianshu.com/u/2285873d6fc4 "resolvewang")我的开源项目：<br><br>分布式微博爬虫<br>&lt;a href="[https://link..](https://link..).

总资产 8 (约 0.61 元) 共写了 3.6W 字获得 561 个赞共 718 个粉丝

### 被以下专题收入，发现更多相似内容

### 推荐阅读[更多精彩内容](https://www.jianshu.com/)

-   本文将从 Redis 的基本特性入手，通过讲述 Redis 的数据结构和主要命令对 Redis 的基本能力进行直观介绍。之后概...

    [![](https://cdn2.jianshu.io/assets/default_avatar/8-a356878e44b45ab268a3b0bbaaadeeb7.jpg)
    kelgon](https://www.jianshu.com/u/f6666ea8c51a)阅读 55,050 评论 23 赞 605
-   转载地址：[http://gnucto.blog.51cto.com/3391516/998509](http://gnucto.blog.51cto.com/3391516/998509) Redis 与 Me...

    [![](https://upload-images.jianshu.io/upload_images/2665779-5c29f98a279ce7ed.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/23ea6815eca8)
-   NOSQL 类型简介键值对：会使用到一个哈希表，表中有一个特定的键和一个指针指向特定的数据，如 redis，volde...
-   Redis 详细介绍 Redis NoSQL:Not Only SQL, 是非关系型数据库; Web2.0 对于上万次的...

    [![](https://upload.jianshu.io/users/upload_avatars/7240015/26c0bdb2-2375-41b5-9292-5b5256f57114.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    LeiLv](https://www.jianshu.com/u/f796a54054d1)阅读 3,311 评论 0 赞 45

    [![](https://upload-images.jianshu.io/upload_images/7240015-88a7eece12def3e4?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/bd5f285bd825)
-   肖乾独自呆在小区外面的山冈上，神情有些恍惚。三天前，他的股票账户被强制平了仓。 作为一个散户，肖乾在股市沉浮数年，...
       [![](https://upload.jianshu.io/users/upload_avatars/3114397/6498ccfa-2602-453b-a974-ae5b74cc1155.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
       旭日秋语](https://www.jianshu.com/u/60e6c47b6bb1)阅读 1,844 评论 90 赞 216
       [![](https://upload-images.jianshu.io/upload_images/3114397-07054c6dabd89eda.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
       ](https://www.jianshu.com/p/7d8ca2285e0c) 
    [https://www.jianshu.com/p/44712ff0528d](https://www.jianshu.com/p/44712ff0528d) 
    [https://www.jianshu.com/p/44712ff0528d](https://www.jianshu.com/p/44712ff0528d)
