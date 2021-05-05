---
title: 修复Firefox“拒绝访问属性文档的权限” – Full Stack Blog
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

### 问题

您正在尝试将脚本从本地文件加载到 Firefox 中显示的页面中（有时可能对测试有用）。

Firefox 报告错误，例如

### 错误：拒绝访问属性 “文档” 的权限

### 错误：拒绝访问属性 “本地” 的权限

### 解决方案

此问题是由通常应设置的安全限制引起的。但是，您可以暂时禁用此安全功能，如下所示：

-   在 Firefox 中输入地址 “about：config”
-   搜索 “ strict\_”
-   双击首选项 “ **security.fileuri.strict_origin_policy** ”的值列，将其从 “true” 切换为“ false”。

![](https://nexnet.files.wordpress.com/2014/10/100314_0502_fixfirefoxp1.png?w=740)

测试完成后，请记住重新启用该策略！

### 资料来源

[https://bugzilla.mozilla.org/show_bug.cgi?id=477201](https://bugzilla.mozilla.org/show_bug.cgi?id=477201)

[https://support.mozilla.org/zh-CN/questions/1003768](https://support.mozilla.org/en-US/questions/1003768)

**已发表** 2014 年 10 月 3 日 2014 年 10 月 10 日 
 [https://maxrohde.com/2014/10/03/fix-firefox-permission-denied-to-access-property-document/](https://maxrohde.com/2014/10/03/fix-firefox-permission-denied-to-access-property-document/) 
 [https://maxrohde.com/2014/10/03/fix-firefox-permission-denied-to-access-property-document/](https://maxrohde.com/2014/10/03/fix-firefox-permission-denied-to-access-property-document/)
