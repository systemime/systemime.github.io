---
title: 技术分享 | MySQL 子查询优化 - SegmentFault 思否
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

> 作者：胡呈清  
> 爱可生 DBA 团队成员，擅长故障分析、性能优化，个人博客：[https://www.jianshu.com/u/a95...](https://www.jianshu.com/u/a95ec11f67a8)，欢迎讨论。  
> 本文来源：原创投稿  
> \*爱可生开源社区出品，原创内容未经授权不得随意使用，转载请联系小编并注明来源。

* * *

有这么一个 SQL，外查询 where 子句的 bizCustomerIncoming_id 字段，和子查询 where 字句的 cid 字段都有高效索引，为什么这个 SQL 执行的非常慢，需要全表扫描？

    delete FROM biz_customer_incoming_path WHERE bizCustomerIncoming_id IN \
    (SELECT id FROM biz_customer_incoming WHERE cid='315upfdv34umngfrxxxxxx');

我们从这么一个问题来引入接下来的内容，如果你知道答案就不用继续看下去了。

## 子查询优化策略

对于不同类型的子查询，优化器会选择不同的策略。

1.  对于 IN、=ANY 子查询，优化器有如下策略选择：

-   semijoin
-   Materialization
-   exists

1.  对于 NOT IN、&lt;>ALL 子查询，优化器有如下策略选择：

-   Materialization
-   exists

1.  对于 derived 派生表，优化器有如下策略选择：

-   derived_merge，将派生表合并到外部查询中（5.7 引入 ）；
-   将派生表物化为内部临时表，再用于外部查询。

**注意：update 和 delete 语句中子查询不能使用 semijoin、materialization 优化策略**

## 优化思路

那么这些策略分别是什么意思？为什么会有这些优化策略？

为方便分析，先建两张表：

    CREATE TABLE `t2` (
      `id` int(11) NOT NULL,
      `a` int(11) DEFAULT NULL,
      `b` int(11) DEFAULT NULL,
      PRIMARY KEY (`id`),
      KEY `a` (`a`)
    ) ENGINE=InnoDB;

    drop procedure idata;
    delimiter ;;
    create procedure idata()
    begin
      declare i int;
      set i=1;
      while(i<=1000)do
        insert into t2 values(i, i, i);
        set i=i+1;
      end while;
    end;;
    delimiter ;
    call idata();

    create table t1 like t2;
    insert into t1 (select * from t2 where id<=100)

有以下子查询示例：

    SELECT * FROM t1 WHERE t1.a IN (SELECT t2.b FROM t2 WHERE id < 10);

你肯定认为这个 SQL 会这样执行：

    SELECT t2.b FROM t2 WHERE id < 10; 
    结果:1,2,3,4,5,6,7,8,9 
    select * from t1 where t1.a in(1,2,3,4,5,6,7,8,9);

但实际上 MySQL 并不是这样做的。MySQL 会将相关的外层表压到子查询中，优化器认为这样效率更高。也就是说，优化器会将上面的 SQL 改写成这样：

    select * from t1 where exists(select b from t2 where id < 10 and t1.a=t2.b);

执行计划为：

    +----+--------------------+-------+-------+---------+------+----------+-------------+
    | id | select_type | table | type | key | rows | filtered | Extra |
    +----+--------------------+-------+-------+---------+------+----------+-------------+
    | 1 | PRIMARY | t1 | ALL | NULL | 100 | 100.00 | Using where |
    | 2 | DEPENDENT SUBQUERY | t2 | range | PRIMARY | 9 | 10.00 | Using where |
    +----+--------------------+-------+-------+---------+------+----------+-------------+

不相关子查询变成了关联子查询（select_type:DEPENDENT SUBQUERY），子查询需要根据 b 来关联外表 t1，因为需要外表的 t1 字段，所以子查询是没法先执行的。执行流程为：

1.  扫描 t1，从 t1 取出一行数据 R；
2.  从数据行 R 中，取出字段 a 执行子查询，如果得到结果为 TRUE，则把这行数据 R 放到结果集；
3.  重复 1、2 直到结束。

总的扫描行数为 100+100\*9=1000（这是理论值，实际值为 964，怎么来的一直没想明白，看规律是子查询结果集每多一行，总扫描行数就会少几行）。

#### Semi-join

这样会有个问题，如果外层表是一个非常大的表，对于外层查询的每一行，子查询都得执行一次，这个查询的性能会非常差。我们很容易想到将其改写成 join 来提升效率：

    select t1.* from t1 join t2 on t1.a=t2.b and t2.id<10;

这样优化可以让 t2 表做驱动表，t1 表关联字段有索引，查找效率非常高。

但这里会有个问题，join 是有可能得到重复结果的，而 in(select ...) 子查询语义则不会得到重复值。而 semijoin 正是解决重复值问题的一种特殊联接。在子查询中，优化器可以识别出 in 子句中每组只需要返回一个值，在这种情况下，可以使用 semijoin 来优化子查询，提升查询效率。这是 MySQL 5.6 加入的新特性，MySQL 5.6 以前优化器只有 exists 一种策略来 “优化” 子查询。经过 semijoin 优化后的 SQL 和执行计划分为：

    select 
        `t1`.`id`,`t1`.`a`,`t1`.`b` 
    from `t1` semi join `t2` 
    where
        ((`t1`.`a` = `<subquery2>`.`b`) 
        and (`t2`.`id` < 10)); 
    ##注意这是优化器改写的SQL，客户端上是不能用 semi join 语法的 
    +----+--------------+-------------+-------+---------+---------------+------+-------------+
    | id | select_type  | table       | type  | key     | ref           | rows | Extra       |
    +----+--------------+-------------+-------+---------+---------------+------+-------------+
    |  1 | SIMPLE       | <subquery2> | ALL   | NULL    | NULL          | NULL | Using where |
    |  1 | SIMPLE       | t1          | ref   | a       | <subquery2>.b |    1 | NULL        |
    |  2 | MATERIALIZED | t2          | range | PRIMARY | NULL          |    9 | Using where |
    +----+--------------+-------------+-------+---------+---------------+------+-------------+

semijoin 优化实现比较复杂，其中又分 FirstMatch、Materialize 等策略，上面的执行计划中 select_type=MATERIALIZED 就是代表使用了 Materialize 策略来实现的 semijoin，后面有专门的文章介绍 semijoin，这里不展开。这里 semijoin 优化后的执行流程为：

1.  先执行子查询，把结果保存到一个临时表中，这个临时表有个主键用来去重；
2.  从临时表中取出一行数据 R；
3.  从数据行 R 中，取出字段 b 到被驱动表 t1 中去查找，满足条件则放到结果集；
4.  重复执行 2、3，直到结束。

这样一来，子查询结果有 9 行，即临时表也有 9 行（这里没有重复值），总的扫描行数为 9+9+9\*1=27 行，比原来的 1000 行少了很多。

#### Materialization

MySQL 5.6 版本中加入的另一种优化特性 materialization，就是把子查询结果物化成临时表，然后代入到外查询中进行查找，来加快查询的执行速度。内存临时表包含主键（hash 索引），消除重复行，使表更小。如果子查询结果太大，超过 tmp_table_size 大小，会退化成磁盘临时表。这跟前面提到的 “我们误以为的” 过程相似，这样子查询只需要执行一次，而不是对于外层查询的每一行都得执行一遍。不过要注意的是，这样外查询依旧无法通过索引快速查找到符合条件的数据，只能通过全表扫描或者全索引扫描，materialization 优化后的执行计划为：

    +----+-------------+-------+-------+---------+------+------+-------------+
    | id | select_type | table | type | key | ref | rows | Extra |
    +----+-------------+-------+-------+---------+------+------+-------------+
    | 1 | PRIMARY | t1 | ALL | NULL | NULL | 100 | Using where |
    | 2 | SUBQUERY | t2 | range | PRIMARY | NULL | 9 | Using where |
    +----+-------------+-------+-------+---------+------+------+-------------+

总扫描行数为 100+9=109。

semijoin 和 materialization 的开启是通过 optimizer_switch 参数中的 semijoin={on|off}、materialization={on|off} 标志来控制的。上文中不同的执行计划就是对 semijoin 和 materialization 进行开 / 关产生的。特意考古找了下 MySQL 5.5 的官方手册，优化策略相当稀少：

![](https://segmentfault.com/img/bVbIOxy)

总的来说对于子查询，先检查是否满足各种优化策略的条件（比如子查询中有 union 则无法使用 semijoin 优化），然后优化器会按成本进行选择，实在没得选就会用 exists 策略来 “优化” 子查询，exists 策略是没有参数来开启或者关闭的。

## 小结

回到开篇的问题，答案是：delete 无法使用 semijoin、materialization 优化策略，会以 exists 方式执行，外查询即 delete biz_customer_incoming_path 表时必须要进行全表扫描。优化的方法也很简单，改成 join 即可（这里是 delete，不用担心重复行问题）：

    delete 
        biz_customer_incoming_path 
    FROM biz_customer_incoming_path a  join biz_customer_incoming b 
    WHERE 
        a.bizCustomerIncoming_id=b.id 
        and b.cid='7Ex46Dz22Fqq6iuPCLPlzQ';

## 参考资料

1. [https://dev.mysql.com/doc/ref...](https://dev.mysql.com/doc/refman/5.7/en/subquery-optimization.html)

1.  《高性能 MySQL》第 6.5.1 章节 
    [https://segmentfault.com/a/1190000023034770](https://segmentfault.com/a/1190000023034770) 
    [https://segmentfault.com/a/1190000023034770](https://segmentfault.com/a/1190000023034770)
