---
title: redis优化系列（十三）redis内存优化及相关配置 - 小周博客,小周个人博客,程序猿小王子,技术博客,个人博客模板,php博客系统,设计模式,wzyl - 黑夜遮不住光亮
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

## Redis 优化及配置

Redis 所有的数据都在内存中，而内存又是非常宝贵的资源。常用的内存优化方案有如下几部分：

一. 配置优化

二. 缩减键值对象

三. 命令处理

四. 缓存淘汰方案

## 一、配置优化

**Linux 配置优化**

目前大部分公司都会将 Web 服务器、数据库服务器等部署在 Linux 操作系统上，Redis 优化也需要考虑操作系统，所以接下来介绍 Linux 操作系统如何优化 Redis。

①、内存分配

vm.overcommit_memory

Redis 是内存操作，需要优先使用内存。设置 overcommit 为 1。是为了让 fork 操作能够在低内存下也执行成功。Linux 操作系统对大部分申请内存的请求都回复 yes，以便能运行更多的程序。因为申请内存后，并不会马上使用内存，这种技术叫做 overcommit。 vm.overcommit_memory 用来设置内存分配策略，有三个可选值：

![](https://www.css3er.com/Uploads/image/20191005/1570284289649147.png)

②、THP

Redis 在启动时可能会看到如下日志：

```

```

Redis 建议修改 Transparent Huge Pages（THP）的相关配置，Linux kernel 在 2.6.38 内核增加了 THP 特性，支持大内存页（2MB）分配，默认开启。当开启时可以降低 fork 子进程的速度，但 fork 操作之后，每个内存页从原来 4KB 变为 2MB，会大幅增加重写期间父进程内存消耗。同时每次写命令引起的复制内存页单位放大了 512 倍，会拖慢写操作的执行时间，导致大量写操作慢查询，例如简单的 incr 命令也会出现在慢查询中。因此 Redis 日志中建议将此特性进行禁用，禁用方法如下：

```

```

为使机器重启后 THP 配置依然生效，可以在 / etc/rc.local 中追加  echo never>/sys/kernel/mm/transparent_hugepage/enabled

③、swappiness

swap 对于操作系统来比较重要，当物理内存不足时，可以将一部分内存页进行 swap 操作，已解燃眉之急。swap 空间由硬盘提供，对于需要高并发、高吞吐的应用来说，磁盘 IO 通常会成为系统瓶颈。在 Linux 中，并不是要等到所有物理内存都使用完才会使用到 swap，系统参数 swppiness 会决定操作系统使用 swap 的倾向程度。swappiness 的取值范围是 0~100，swappiness 的值越大，说明操作系统可能使用 swap 的概率越高，swappiness 值越低，表示操作系统更加倾向于使用物理内存。swap 的默认值是 60，了解这个值的含义后，有利于 Redis 的性能优化。下图对 swappiness 的重要值进行了说明：

![](https://www.css3er.com/Uploads/image/20191005/1570284661119131.png)

OOM（Out Of Memory）killer 机制是指 Linux 操作系统发现可用内存不足时，强制杀死一些用户进程（非内核进程），来保证系统有足够的可用内存进行分配。 为使配置在重启 Linux 操作系统后立即生效，只需要在 / etc/sysctl.conf 追加 vm.swappiness={bestvalue} 即可。

echo vm.swappiness={bestvalue} >> /etc/sysctl.conf

查看 swap 的总体情况可使用 free-m 命令，如下服务器开启了 8189M swap，其中使用了 5241MB

![](https://www.css3er.com/Uploads/image/20191005/1570284999711598.png)

④、ulimit 设置

可以通过 ulimit 查看和设置系统当前用户进程的资源数。其中 ulimit-a 命令包含的 open files 参数，是单个用户同时打开的最大文件个数：

![](https://www.css3er.com/Uploads/image/20191005/1570285113455565.png)

Redis 允许同时有多个客户端通过网络进行连接，可以通过配置 maxclients 来限制最大客户端连接数。对 Linux 操作系统来说，这些网络连接都是文件句柄。假设当前 open files 是 4096，那么启动 Redis 时会看到如下日志：

\#You requested maxclients of 10000 requiring at least 10032 max file descriptors.

\#Redis can’t set maximum open files to 10032 because of OS error: Operation not permitted.

\#Current maximum open files is 4096. Maxclients has been reduced to 4064 to compensate for low ulimit. If you need higher maxclients increase 'ulimit –n'.

**上面日志的内容解释如下：** 

第一行：Redis 建议把 open files 至少设置成 10032，那么这个 10032 是如何来的呢？因为 maxclients 默认是 10000，这些是用来处理客户端连接的，除此之外，Redis 内部会使用最多 32 个文件描述符，所以这里的 10032=10000+32。

第二行：Redis 不能将 open files 设置成 10032，因为它没有权限设置。

第三行：当前系统的 open files 是 4096，所以将 maxclients 设置成 4096-32=4064 个，如果你想设置更高的 maxclients，请使用 ulimit-n 来设置。

从上面的三行日志分析可以看出 open files 的限制优先级比 maxclients 大。

Open files 的设置方法如下：

```

```

**Redis 配置优化**

①、设置 maxmemory。设置 Redis 使用的最大物理内存，即 Redis 在占用 maxmemory 大小的内存之后就开始拒绝后续的写入请求，该参数可以确保 Redis 因为使用了大量内存严重影响速度或者发生 OOM(out-of-memory，发现内存不足时，它会选择杀死一些进程 (用户态进程，不是内核线程)，以便释放内存)。此外，可以使用 info 命令查看 Redis 占用的内存及其它信息。

②、让键名保持简短。键的长度越长，Redis 需要存储的数据也就越多

③、客户端 timeout 设置一个超时时间，防止无用的连接占用资源。设置如下命令：

    timeout 150

    tcp-keepalive 150 （定时向 client 发送 tcp_ack 包来探测 client 是否存活的。默认不探测）

④、检查数据持久化策略

    数据落磁盘尽可能减少性能损坏，以空间换时间。设置如下命令：

    rdbcompression no : 默认值是 yes。对于存储到磁盘中的快照，可以设置是否进行压缩存储。如果是的话，redis 会采用 LZF 算法进行压缩。如果你不想消耗 CPU 来进行压缩的话，可以设置为关闭此功能，但是存储在磁盘上的快照会比较大。

    rdbchecksum no : 默认值是 yes。在存储快照后，我们还可以让 redis 使用 CRC64 算法来进行数据校验，但是这样做会增加大约 10% 的性能消耗，如果希望获取到最大的性能提升，可以关闭此功能。

⑤、优化 AOF 和 RDB，减少占用 CPU 时间

    主库可以不进行 dump 操作或者降低 dump 频率。取消 AOF 持久化。

    命令如下：

    appendonly no

⑥、监控客户端的连接

    因为 Redis 是单线程模型（只能使用单核），来处理所有客户端的请求， 但由于客户端连接数的增长，处理请求的线程资源开始降低分配给单个客户端连接的处理时间

⑦、限制客户端连接数 。在 Redis-cli 工具中输入 info clients 可以查看到当前实例的所有客户端连接信息

    maxclients 属性上修改客户端连接的最大数，可以通过在 Redis-cli 工具上输入 config set maxclients 去设置最大连接数。根据连接数负载的情况。

## 二、缩减键值对象

降低 Redis 内存使用最直接的方式就是缩减键（key）和值（value）的长度。

-   key 长度：如在设计键时，在完整描述业务情况下，键值越短越好。
-   value 长度：值对象缩减比较复杂，常见需求是把业务对象序列化成二进制数组放入 Redis。首先应该在业务上精简业务对象，在存到 Redis 之前先把你的数据压缩下。

常用压缩方法对比：

![](https://www.css3er.com/Uploads/image/20191005/1570286485446015.png)

* * *

## 三、命令处理

Redis 基于 C/S 架构模式，基于 Redis 操作命令是解决响应延迟问题最关键的部分，因为 Redis 是个单线程模型，客户端过来的命令是按照顺序执行的。比较常见的延迟是带宽，通过千兆网卡的延迟大约有 200μs。倘若明显看到命令的响应时间变慢，延迟高于 200μs，那可能是 Redis 命令队列里等待处理的命令数量比较多。

要分析解决这个性能问题，需要跟踪命令处理数的数量和延迟时间。

比如可以写个脚本，定期记录 total_commands_processed 的值。当客户端明显发现响应时间过慢时，可以通过记录的 total_commands_processed 历史数据值来判断命理处理总数是上升趋势还是下降趋势，以便排查问题。

在 info 信息里的 total_commands_processed 字段显示了 Redis 服务处理命令的总数

![](https://www.css3er.com/Uploads/image/20191005/1570287385593212.png)

![](https://www.css3er.com/Uploads/image/20191005/1570287390983126.png)

解决方案：

①、使用多参数命令：若是客户端在很短的时间内发送大量的命令过来，会发现响应时间明显变慢，这由于后面命令一直在等待队列中前面大量命令执行完毕。有个方法可以改善延迟问题，就是通过单命令多参数的形式取代多命令单参数的形式。

举例来说：循环使用 LSET 命令去添加 1000 个元素到 list 结构中，是性能比较差的一种方式，更好的做法是在客户端创建一个 1000 元素的列表，用单个命令 LPUSH 或 RPUSH，通过多参数构造形式一次性把 1000 个元素发送的 Redis 服务上。下面是 Redis 的一些操作命令，有单个参数命令和支持多个参数的命令，通过这些命令可尽量减少使用多命令的次数。

②、管道命令：另一个减少多命令的方法是使用管道 (pipeline)，把几个命令合并一起执行，从而减少因网络开销引起的延迟问题。因为 10 个命令单独发送到服务端会引起 10 次网络延迟开销，使用管道会一次性把执行结果返回，仅需要一次网络延迟开销。Redis 本身支持管道命令，大多数客户端也支持，倘若当前实例延迟很明显，那么使用管道去降低延迟是非常有效的。

## 四、缓存淘汰优化

redis 内存数据集大小上升到一定大小的时候，就会进行数据淘汰策略。如果不淘汰经常不用的缓存数据，那么正常的数据将不会存储到缓存当中。

可通过配置 redis.conf 中的 maxmemory 这个值来开启内存淘汰功能。

maxmemory

值得注意的是，maxmemory 为 0 的时候表示我们对 Redis 的内存使用没有限制。

根据应用场景，选择淘汰策略

maxmemory-policy noeviction

内存淘汰的过程如下：

①、首先，客户端发起了需要申请更多内存的命令（如 set）。

②、然后，Redis 检查内存使用情况，如果已使用的内存大于 maxmemory 则开始根据用户配置的不同淘汰策略来淘汰内存（key），从而换取一定的内存。

③、最后，如果上面都没问题，则这个命令执行成功。

### 动态改配置命令

此外，redis 支持动态改配置，无需重启。

**设置最大内存**

config set maxmemory 100000

**设置淘汰策略**

config set maxmemory-policy noeviction

### 内存淘汰策略

volatile-lru

从已设置过期时间的数据集（server.db\[i].expires）中挑选最近最少使用的数据淘汰。

allkeys-lru

从数据集（server.db\[i].dict）中挑选最近最少使用的数据淘汰

volatile-lfu

从设置了过期时间的数据集（server.db\[i].expires）中选择某段时间之内使用频次最小的键值对清除掉

allkeys-lfu

从所有的数据集（server.db\[i].dict）中选择某段时间之内使用频次最少的键值对清除

volatile-ttl

从已设置过期时间的数据集（server.db\[i].expires）中挑选将要过期的数据淘汰

volatile-random

从已设置过期时间的数据集（server.db\[i].expires）中任意选择数据淘汰

allkeys-random

从数据集（server.db\[i].dict）中任意选择数据淘汰

no-enviction

当内存达到限制的时候，不淘汰任何数据，不可写入任何数据集，所有引起申请内存的命令会报错。

算法文章：（[https://blog.csdn.net/ZYZMZM\_/article/details/90546812](https://blog.csdn.net/ZYZMZM_/article/details/90546812 "https&#x3A;//blog.csdn.net/ZYZMZM\_/article/details/90546812")）

### 如何选择淘汰策略

下面看看几种策略的适用场景

allkeys-lru：如果我们的应用对缓存的访问符合幂律分布，也就是存在相对热点数据，或者我们不太清楚我们应用的缓存访问分布状况，我们可以选择 allkeys-lru 策略。

allkeys-random：如果我们的应用对于缓存 key 的访问概率相等，则可以使用这个策略。

volatile-ttl：这种策略使得我们可以向 Redis 提示哪些 key 更适合被 eviction。

另外，volatile-lru 策略和 volatile-random 策略适合我们将一个 Redis 实例既应用于缓存和又应用于持久化存储的时候，然而我们也可以通过使用两个 Redis 实例来达到相同的效果，值得一提的是将 key 设置过期时间实际上会消耗更多的内存，因此建议使用 allkeys-lru 策略从而更有效率的使用内存。

虽然辛苦  我还是会选择那种滚烫的人生    --> 北野武  

**声明：禁止任何非法用途使用，凡因违规使用而引起的任何法律纠纷，本站概不负责。** 
 [https://www.css3er.com/p/196.html](https://www.css3er.com/p/196.html) 
 [https://www.css3er.com/p/196.html](https://www.css3er.com/p/196.html)
