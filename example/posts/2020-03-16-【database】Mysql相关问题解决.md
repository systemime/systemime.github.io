---
title: 【database】Mysql相关问题解决
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

<a name="Q0jxo"></a>
# mysql错误提示： django.db.utils.InternalError: (1366, "Incorrect string value"...)解决方案
问题：<br />在Django项目中使用 migrate 同步数据库操作时，出现1366类型 InternalError<br />
<br />出错原因：<br />由于表记录中有汉字，而创建库或者创建表的时候没有设置中文字符集charset=utf8<br />
<br />解决方案：<br />方案一、更改库的默认字符集<br />
<br />创建库的时候指定默认字符集：<br />
<br />create database 库名 default charset=utf8;<br />
<br />或者修改现有库的字符集：<br />
<br />alter database 库名 character set utf8;<br />
<br />方案二、更改表的默认字符集，<br />
<br />创建表的时候指定默认字符集<br />
<br />create table 表名 (...) default charset=utf8;<br />
<br />或者修改现有表的字符集<br />
<br />alter table 表名 character set utf8；<br />
<br />方案三、修改配置文件（新创建的库和表会自动设置中文字符集）<br />
<br />修改配置文件详细步骤： （注意：为了防止把配置文件改错，修改之前先将其备份）<br />
<br /># 获取用户权限：<br />sudo -i<br /># 进入到mysql配置文件所在路径：<br />cd /etc/mysql/mysql.conf.d/<br />
<br /># 备份（-p选项会把原文件的权限也一起复制）<br />cp -p mysql.cnf mysql.cnf.bak #用vi打开配置文件mysqld.cnf并进行修改：<br />
<br />输入vi mysqld.cnf<br />找到 [mysqld]，在 tmpdir =/tmp 后面按o键换行插入 character_set_server=utf8（如图所示）：<br />
<br />按esc键 退出插入模式，按shift + : 进入命令行，输入wq保存并退出<br />输入 /etc/init.d/mysql restart 重启mysql服务<br />输入exit 退出超级用户模式<br />这样，配置文件就修改成功了<br />
<br />最后，提一下有可能导致修改失败的两个问题<br />
<br />1.如果在修改配置文件的过程中改错了配置，可以进入配置文件所在路径，删除已经保存修改的原配置文件 mysqld.cnf，输入mv mysqld.cnf.bak mysqld.cnf ，把备份的配置文件重命名为配置文件就可以还原，然后再执行上述步骤进行正确的修改即可。<br />
<br />2.如果因为权限问题没有修改成功，则可以输入chmod更改文件权限再进行修改。<br />

<a name="d0qaz"></a>
# 解决MySQL8.0安装第一次登陆修改密码时出现的问题
mysql数据库初始化后初次登录需要修改密码<br />
<br />初次登录会碰到下面这个错误<br />
<br />ql> alter user root identified by ‘password';<br />ERROR 1820 (HY000): You must reset your password using ALTER USER statement before executing this statement.<br />
<br />需要使用下面的命令来修改密码<br />
<br />mysql> alter user user() identified by ‘password';<br />Query OK, 0 rows affected (1.43 sec)
