---
title: mysql按年度、季度、月度、周、日SQL统计查询-冰仔-51CTO博客
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

说明

    SELECT YEAR('2014-10-29')   //2014
    SELECT MONTH('2014-10-29')  //10
    SELECT DAY('2014-10-29')  //29
    SELECT QUARTER('2014-10-29')  //4  季度
    SELECT DAYOFWEEK('2014-10-29') //4  星期

一、年度查询  
查询本年度的数据

    SELECT *
    FROM blog_article
    WHERE year( FROM_UNIXTIME( BlogCreateTime ) ) = year( curdate( ))

二、查询季度数据  
查询数据附带季度数

    SELECT ArticleId, quarter( FROM_UNIXTIME( `BlogCreateTime` ) )
    FROM `blog_article`

其他的同前面部分：查询本季度的数据

    SELECT *
    FROM blog_article
    WHERE quarter( FROM_UNIXTIME( BlogCreateTime ) ) = quarter( curdate( ))

三、查询月度数据  
本月统计 (MySQL)

    select * from booking where month(booking_time) =
    month(curdate()) and year(booking_time) = year(curdate())

本周统计 (MySQL)

    select * from spf_booking where month(booking_time) =
    month(curdate()) and week(booking_time) = week(curdate())

四、时间段  
N 天内记录

    WHERE TO_DAYS(NOW()) - TO_DAYS(时间字段) <= N

当天的记录

    where date(时间字段)=date(now())

或

    where to_days(时间字段) = to_days(now());

查询一周

    select * from table   where DATE_SUB(CURDATE(), INTERVAL 7 DAY) <= date(column_time);

查询一个月

    select * from table where DATE_SUB(CURDATE(), INTERVAL INTERVAL 1 MONTH) <= date(column_time);

查询’06-03’到’07-08’这个时间段内所有过生日的会员：

    Select * From user Where
    DATE_FORMAT(birthday,'%m-%d') >= '06-03' and DATE_FORMAT(birthday,'%m-%d')<= '07-08';

统计一季度数据，表时间字段为：savetime

    group by concat(date_format(savetime, '%Y '),FLOOR((date_format(savetime, '%m ')+2)/3))

或

    select YEAR(savetime)*10+((MONTH(savetime)-1) DIV 3) +1,count(*)
    from yourTable
    group by YEAR(savetime)*10+((MONTH(savetime)-1) DIV 3) +1;

五、分组查询  
1、年度分组  
2、月度分组  
3、先按年度分组，再按月度分组  
4、按年月分组

    SELECT count(ArticleId), date_format(FROM_UNIXTIME( `BlogCreateTime`),'%y%m') sdate  FROM `blog_article` group by sdate

结果：

    count( ArticleId )     sdate

    17     0901

    11     0902

    5     0903

    6     0904

    2     0905

    1     0907

    12     0908

    6     0909

    11     0910

    3     0911

其他方法参考：  
我想做一个统计，数据库是 mysql，统计出每天，每周，每月的记录数  
建表的时候加个字段表示日期，然后查 sql 手册…

    select count(*) from `table` where `date`='{某天}'
    select count(*) from `table` where date_format(`date`,'%V')='{某周}'
    select count(*) from `table` where date_format(`date`,'%c')='{某月}'

另一种方法：

    select count( * ) from projects where editdate >= '2007-11-9 00:00:00' and editdate <=
    '2007-11-9 24:00:00';

第三种方法：  
每周的

    SQL codeselect count(*) as cnt,week(editdate) as weekflg from projects where year(editdate)
    =2007 group by weekflg

每月

    SQL codeselect count(*) as cnt,month(editdate) as monthflg from projects where year
    (editdate)=2007 group by monthflg

每天

    SQL codeselect count(*) as cnt from projects group by date(editdate)

mysql 中 DATE_FORMAT(date, format) 函数可根据 format 字符串格式化日期或日期和时间值 date，返回结果  
串。  
也可用 DATE_FORMAT( ) 来格式化 DATE 或 DATETIME 值，以便得到所希望的格式。根据 format 字符串格式  
化 date 值:  
下面是函数的参数说明:

    %S, %s 两位数字形式的秒（ 00,01, . . ., 59）
    %i 两位数字形式的分（ 00,01, . . ., 59）
    %H 两位数字形式的小时，24 小时（00,01, . . ., 23）
    %h, %I 两位数字形式的小时，12 小时（01,02, . . ., 12）
    %k 数字形式的小时，24 小时（0,1, . . ., 23）
    %l 数字形式的小时，12 小时（1, 2, . . ., 12）
    %T 24 小时的时间形式（hh : mm : s s）
    %r 12 小时的时间形式（hh:mm:ss AM 或hh:mm:ss PM）
    %p AM 或P M
    %W 一周中每一天的名称（ Sunday, Monday, . . ., Saturday）
    %a 一周中每一天名称的缩写（ Sun, Mon, . . ., Sat）
    %d 两位数字表示月中的天数（ 00, 01, . . ., 31）
    %e 数字形式表示月中的天数（ 1, 2， . . ., 31）
    %D 英文后缀表示月中的天数（ 1st, 2nd, 3rd, . . .）
    %w 以数字形式表示周中的天数（ 0 = Sunday, 1=Monday, . . ., 6=Saturday）
    %j 以三位数字表示年中的天数（ 001, 002, . . ., 366）
    % U 周（0, 1, 52），其中Sunday 为周中的第一天
    %u 周（0, 1, 52），其中Monday 为周中的第一天
    %M 月名（January, February, . . ., December）
    %b 缩写的月名（ January, February, . . ., December）
    %m 两位数字表示的月份（ 01, 02, . . ., 12）
    %c 数字表示的月份（ 1, 2, . . ., 12）
    %Y 四位数字表示的年份
    %y 两位数字表示的年份
    %% 直接值“%”

注：文章由[seo 技术](http://www.618sale.com/) [http://www.618sale.com/](http://www.618sale.com/) 进行编辑，转载需注明来源。 
 [https://blog.51cto.com/hfreeze/1569278](https://blog.51cto.com/hfreeze/1569278) 
 [https://blog.51cto.com/hfreeze/1569278](https://blog.51cto.com/hfreeze/1569278)
