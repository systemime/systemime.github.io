---
title: 存储过程 + insert into values (),(),();插入海量数据_uj-CSDN博客_insert into 存储过程
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

发现该文存储过程中使用 `insert into values` 插入数据，但是每次只插入一条数据，因此，决定一次插入十条观察效率

> 参考文章 ：[重新学习 MySQL 数据库 12：从实践 sql 语句优化开始](https://blog.csdn.net/a724888/article/details/79394168#t1) -> `自己写的海量数据 sql 优化实践`

**测试环境**： Mysql 5.7, Navicat 12.0.18  
**插入 10 万条数据结果**：  
![](https://img-blog.csdnimg.cn/20181027112131955.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2FpX3NodXlpbmd6aGl4aWE=,size_27,color_FFFFFF,t_70)

_其中_ set global general_log = on 用于开启日志，off 用于关闭日志。 general_log 将所有到达 MySQL Server 的 SQL 语句记录下来。

**代码如下**

```
-- 创建插入数据的存储过程
DROP PROCEDURE IF EXISTS `add_vote_record_memory`;
DELIMITER //
CREATE PROCEDURE `add_vote_record_memory`(IN n INT)
BEGIN
    DECLARE i INT DEFAULT 1;
    WHILE i < n DO
        INSERT INTO `vote_record_memory` 
						VALUES
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW()),
							(NULL, rand_string(20), FLOOR(1 + RAND() * 10000), FLOOR(0 + RAND()*3), FLOOR(1 + RAND()*2), NOW());							
        SET i = i + 10;
    END WHILE;
END //
DELIMITER ;  -- 改回默认的 MySQL delimiter：';'

```

站在巨人的肩膀上，才能尿得更远。。。 
 [https://blog.csdn.net/ai_shuyingzhixia/article/details/83444706](https://blog.csdn.net/ai_shuyingzhixia/article/details/83444706) 
 [https://blog.csdn.net/ai_shuyingzhixia/article/details/83444706](https://blog.csdn.net/ai_shuyingzhixia/article/details/83444706)
