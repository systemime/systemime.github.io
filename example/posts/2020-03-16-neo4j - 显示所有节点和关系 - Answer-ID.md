---
title: neo4j - 显示所有节点和关系 - Answer-ID
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

[](https://answer-id.com/zh/53396906#answer-57097587)48

您可能还想尝试一个密码查询，例如：

```
START n=node(*) RETURN n;

```

这很明显，它将返回数据库中的所有现有节点。

编辑：以下显示节点和关系：

```
START n=node(*) MATCH (n)-[r]->(m) RETURN n,r,m;

```

[](https://answer-id.com/zh/53396906#answer-57097590)10

更简单的方法是

```
MATCH (n) RETURN (n)

```

[](https://answer-id.com/zh/53396906#answer-57097586)9

搜索字段旁边有一个小帮助图标，如果你翻看它就会显示语法。

如果您的节点和关系的属性已编制​​索引，则可以像这样搜索所有这些属性。

```
node:index:indexname:fieldname:*
rels:index:indexname:fieldname:*

```

[](https://answer-id.com/zh/53396906#answer-57097589)8

您可以使用简单的 `MATCH（n）RETURN n` 显示所有内容，作为官方文档[建议](https://answer-id.com/zh/%E2%80%9Chttp://docs.neo4j.org/chunked/stable/query-match.html#match-%E5%BE%97%E5%88%B0-%E6%89%80%E6%9C%89%E8%8A%82%E7%82%B9%E2%80%9C)。

`START n=node(*) RETURN n` from Neo4j 2.0 is [deprecated](http://docs.neo4j.org/chunked/stable/query-start.html):

> 仅在访问旧索引时才使用 `START` 子句   （参见[第 34 章，遗留索引](http://docs.neo4j.org/chunked/stable/indexing.html)）。在所有其他情况下，使用 `MATCH`   相反（参见[第 10.1 节，“匹配”](http://docs.neo4j.org/chunked/stable/query-match.html)）。

[](https://answer-id.com/zh/53396906#answer-57097592)7

```
MATCH (n) OPTIONAL MATCH (n)-[r]-() RETURN n, r;

```

[](https://answer-id.com/zh/53396906#answer-57097588)1

获取所有节点（和没有关系的节点）的其他好方法：

```
MATCH (n) RETURN n UNION START n = rel(*) return n;

```

[](https://answer-id.com/zh/53396906#answer-57097591)1

无名氏

我发现这有效，检索包括孤儿在内的所有节点以及所有关系：

```
MATCH (n) MATCH ()-[r]->() RETURN n, r

```

 [https://answer-id.com/zh/53396906](https://answer-id.com/zh/53396906) 
 [https://answer-id.com/zh/53396906](https://answer-id.com/zh/53396906)
