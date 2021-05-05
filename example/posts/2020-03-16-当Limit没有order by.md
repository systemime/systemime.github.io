---
title: 当Limit没有order by
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

<a name="U3Ta4"></a>
## 两段没什么问题是SQL
```sql
SELECT
		`a`.*,
    `b`.`name` AS `xxx_name`,
    ...
    FROM `axx` AS `a`
    LEFT JOIN `xxx` AS `b`
    ON `a`.`xxx`=`b`.id
    WHERE `status`=0
    LIMIT 0, 10;


SELECT
		`a`.*,
    `b`.`name` AS `xxx_name`,
    ...
    FROM `axx` AS `a`
    LEFT JOIN `xxx` AS `b`
    ON `a`.`xxx`=`b`.id
    WHERE `status`=0
```
看起来第一段sql仅仅比第二段sql多了一个`limit`对不对，如果你在你的终端里执行，大概率也是得到相同的结果<br />（上下文默认**InnoDB数据库引擎**）<br />

> 初始查询时order by等条件默认为空，用户操作传入各种查询排序条件


<br />在线上环境中，这两段落sql分别服务于某数据的分页展示和数据导出，然而问题来了<br />![image.png](https://cdn.nlark.com/yuque/0/2020/png/663138/1595924656696-b0b07945-a629-4d43-b274-390a3cf6b2aa.png#align=left&display=inline&height=91&margin=%5Bobject%20Object%5D&name=image.png&originHeight=121&originWidth=685&size=14339&status=done&style=shadow&width=514)<br />
<br />开始进行问题定位，一番查找，找到两篇资料，解决了我的疑惑
> [https://www.zhihu.com/question/24315588](https://www.zhihu.com/question/24315588)
> [https://learnku.com/articles/25270](https://learnku.com/articles/25270)
> ([https://github.com/XiaoMi/soar/blob/master/doc/heuristic.md](https://github.com/XiaoMi/soar/blob/master/doc/heuristic.md))



<a name="qGQRz"></a>
## 故障原因
上图吧

- 小米：启发式规则建议

![image.png](https://cdn.nlark.com/yuque/0/2020/png/663138/1595924883117-a8356446-e51e-4ba8-bd13-66ad27c5f4c9.png#align=left&display=inline&height=230&margin=%5Bobject%20Object%5D&name=image.png&originHeight=307&originWidth=871&size=28916&status=done&style=shadow&width=653)

- 知乎回答：[@mysqlops](https://www.zhihu.com/people/mysqlops)

![image.png](https://cdn.nlark.com/yuque/0/2020/png/663138/1595924929070-c0a322f7-2ddb-4ed1-8fb2-f143507d13af.png#align=left&display=inline&height=214&margin=%5Bobject%20Object%5D&name=image.png&originHeight=285&originWidth=687&size=42047&status=done&style=shadow&width=515)<br />
<br />结合两篇文章内容可以看出，mysql在使用`InnoDB`时，如果没有默认的`order by`，则不会使用主键，将会使用默认的where具有索引顺序的字段进行排序分页，同时，没有指定order by最终查询结果取决于查询执行计划
