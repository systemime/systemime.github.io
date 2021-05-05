---
title: MySQL Explain详解 - GoogSQL - 博客园
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

在日常工作中，我们会有时会开慢查询去记录一些执行时间比较久的 SQL 语句，找出这些 SQL 语句并不意味着完事了，些时我们常常用到 explain 这个命令来查看一个这些 SQL 语句的执行计划，查看该 SQL 语句有没有使用上了索引，有没有做全表扫描，这都可以通过 explain 命令来查看。所以我们深入了解 MySQL 的基于开销的优化器，还可以获得很多可能被优化器考虑到的访问策略的细节，以及当运行 SQL 语句时哪种策略预计会被优化器采用。（QEP：sql 生成一个执行计划 query Execution plan）

![](https://common.cnblogs.com/images/copycode.gif)

mysql> explain select \* from servers; +----+-------------+---------+------+---------------+------+---------+------+------+-------+
| id | select_type | table   | type | possible_keys | key  | key_len | ref  | rows | Extra |
\+----+-------------+---------+------+---------------+------+---------+------+------+-------+
|  1 | SIMPLE      | servers | ALL  | NULL          | NULL | NULL    | NULL |    1 | NULL  |
\+----+-------------+---------+------+---------------+------+---------+------+------+-------+
1 row in set (0.03 sec)

![](https://common.cnblogs.com/images/copycode.gif)

expain 出来的信息有 10 列，分别是 id、select_type、table、type、possible_keys、key、key_len、ref、rows、Extra, 下面对这些字段出现的可能进行解释：

一、 **id**

**我的理解是 SQL 执行的顺序的标识, SQL 从大到小的执行**

1. id 相同时，执行顺序由上至下

2. 如果是子查询，id 的序号会递增，id 值越大优先级越高，越先被执行

3.id 如果相同，可以认为是一组，从上往下顺序执行；在所有组中，id 值越大，优先级越高，越先执行

**二、select_type**

\***\* 示查询中每个 select 子句的类型 \*\***

(1) SIMPLE(简单 SELECT, 不使用 UNION 或子查询等)

(2) PRIMARY(查询中若包含任何复杂的子部分, 最外层的 select 被标记为 PRIMARY)

(3) UNION(UNION 中的第二个或后面的 SELECT 语句)

(4) DEPENDENT UNION(UNION 中的第二个或后面的 SELECT 语句，取决于外面的查询)

(5) UNION RESULT(UNION 的结果)

(6) SUBQUERY(子查询中的第一个 SELECT)

(7) DEPENDENT SUBQUERY(子查询中的第一个 SELECT，取决于外面的查询)

(8) DERIVED(派生表的 SELECT, FROM 子句的子查询)

(9) UNCACHEABLE SUBQUERY(一个子查询的结果不能被缓存，必须重新评估外链接的第一行)

**三、table**

显示这一行的数据是关于哪张表的，有时不是真实的表名字, 看到的是 derivedx(x 是个数字, 我的理解是第几步执行的结果)

![](https://common.cnblogs.com/images/copycode.gif)

mysql> explain select \* from (select \* from ( select \* from t1 where id\\=2602) a) b; +----+-------------+------------+--------+-------------------+---------+---------+------+------+-------+
| id | select_type | table      | type   | possible_keys     | key     | key_len | ref  | rows | Extra |
\+----+-------------+------------+--------+-------------------+---------+---------+------+------+-------+
|  1 | PRIMARY     | &lt;derived2> | system | NULL              | NULL    | NULL    | NULL |    1 |       |
|  2 | DERIVED     | &lt;derived3> | system | NULL              | NULL    | NULL    | NULL |    1 |       |
|  3 | DERIVED     | t1         | const  | PRIMARY,idx_t1_id | PRIMARY | 4       |      |    1 |       |
\+----+-------------+------------+--------+-------------------+---------+---------+------+------+-------+

![](https://common.cnblogs.com/images/copycode.gif)

**四、type**

表示 MySQL 在表中找到所需行的方式，又称 “访问类型”。

常用的类型有：**ALL, index,  range, ref, eq_ref, const, system, NULL（从左到右，性能从差到好）**

ALL：Full Table Scan， MySQL 将遍历全表以找到匹配的行

index: Full Index Scan，index 与 ALL 区别为 index 类型只遍历索引树

range: 只检索给定范围的行，使用一个索引来选择行

ref: 表示上述表的连接匹配条件，即哪些列或常量被用于查找索引列上的值

eq_ref: 类似 ref，区别就在使用的索引是唯一索引，对于每个索引键值，表中只有一条记录匹配，简单来说，就是多表连接中使用 primary key 或者 unique key 作为关联条件

const、system: 当 MySQL 对查询某部分进行优化，并转换为一个常量时，使用这些类型访问。如将主键置于 where 列表中，MySQL 就能将该查询转换为一个常量, system 是 const 类型的特例，当查询的表只有一行的情况下，使用 system

NULL: MySQL 在优化过程中分解语句，执行时甚至不用访问表或索引，例如从一个索引列里选取最小值可以通过单独索引查找完成。

**五、possible_keys**

**指出 MySQL 能使用哪个索引在表中找到记录，查询涉及到的字段上若存在索引，则该索引将被列出，但不一定被查询使用**

该列完全独立于 EXPLAIN 输出所示的表的次序。这意味着在 possible_keys 中的某些键实际上不能按生成的表次序使用。  
如果该列是 NULL，则没有相关的索引。在这种情况下，可以通过检查 WHERE 子句看是否它引用某些列或适合索引的列来提高你的查询性能。如果是这样，创造一个适当的索引并且再次用 EXPLAIN 检查查询

**六、Key**

**key 列显示 MySQL 实际决定使用的键（索引）**

如果没有选择索引，键是 NULL。要想强制 MySQL 使用或忽视 possible_keys 列中的索引，在查询中使用 FORCE INDEX、USE INDEX 或者 IGNORE INDEX。

**七、key_len**

\***\* 表示索引中使用的字节数，可通过该列计算查询中使用的索引的长度（key_len 显示的值为索引字段的最大可能长度，并非实际使用长度，即 key_len 是根据表定义计算而得，不是通过表内检索出的）\*\***

不损失精确性的情况下，长度越短越好

**八、ref**

**表示上述表的连接匹配条件，即哪些列或常量被用于查找索引列上的值**

**九、rows**

 **表示 MySQL 根据表统计信息及索引选用情况，估算的找到所需的记录所需要读取的行数**

**十、Extra**

**该列包含 MySQL 解决查询的详细信息, 有以下几种情况：** 

Using where: 列数据是从仅仅使用了索引中的信息而没有读取实际的行动的表返回的，这发生在对表的全部的请求列都是同一个索引的部分的时候，表示 mysql 服务器将在存储引擎检索行后再进行过滤

Using temporary：表示 MySQL 需要使用临时表来存储结果集，常见于排序和分组查询

Using filesort：MySQL 中无法利用索引完成的排序操作称为 “文件排序”

Using join buffer：改值强调了在获取连接条件时没有使用索引，并且需要连接缓冲区来存储中间结果。如果出现了这个值，那应该注意，根据查询的具体情况可能需要添加索引来改进能。

Impossible where：这个值强调了 where 语句会导致没有符合条件的行。

Select tables optimized away：这个值意味着仅通过使用索引，优化器可能仅从聚合函数结果中返回一行

**总结：** **• EXPLAIN 不会告诉你关于触发器、存储过程的信息或用户自定义函数对查询的影响情况  
• EXPLAIN 不考虑各种 Cache  
• EXPLAIN 不能显示 MySQL 在执行查询时所作的优化工作  
• 部分统计信息是估算的，并非精确值  
• EXPALIN 只能解释 SELECT 操作，其他操作要重写为 SELECT 后查看执行计划。** 

参考资料：[http://dev.mysql.com/doc/refman/5.5/en/explain-output.html](http://dev.mysql.com/doc/refman/5.5/en/explain-output.html)

                [http://www.cnitblog.com/aliyiyi08/archive/2008/09/09/48878.html](http://www.cnitblog.com/aliyiyi08/archive/2008/09/09/48878.html)

                [http://www.cnblogs.com/gomysql/p/3720123.html](http://www.cnblogs.com/gomysql/p/3720123.html) 
 [https://www.cnblogs.com/xuanzhi201111/p/4175635.html](https://www.cnblogs.com/xuanzhi201111/p/4175635.html) 
 [https://www.cnblogs.com/xuanzhi201111/p/4175635.html](https://www.cnblogs.com/xuanzhi201111/p/4175635.html)
