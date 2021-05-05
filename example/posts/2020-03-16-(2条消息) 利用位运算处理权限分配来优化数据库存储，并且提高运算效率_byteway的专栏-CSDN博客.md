---
title: (2条消息) 利用位运算处理权限分配来优化数据库存储，并且提高运算效率_byteway的专栏-CSDN博客
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

![](https://csdnimg.cn/release/blogv2/dist/pc/img/original.png)

[byte_way](https://blog.csdn.net/zhx278171313) 2014-03-26 23:21:58 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/articleReadEyes.png)
 2578 ![](https://csdnimg.cn/release/blogv2/dist/pc/img/tobarCollect.png)
 收藏  2 

版权声明：本文为博主原创文章，遵循 [CC 4.0 BY-SA](http://creativecommons.org/licenses/by-sa/4.0/) 版权协议，转载请附上原文出处链接和本声明。

这个是临阵磨枪的，在现在做的一个 OA 项目中，由于多权限造成后台静态管理网页泛滥了，现在不得不改进些新的技术，又因为以前的权限表是作为管理员表的外键，给这次修改带来很大麻烦，所以想到了类似与 Linux 的位运算权限管理方法。

其实微软的 API 参数很多也是使用宏定义好的，然后才可以进行或运算的传参，如一个 MessageBox 的参数大致可是这样的，有一个按钮 | 有提示图标 | 有提示文字 等等，这样的或运算得到的结果就是功能都包含的结果.

先以 Linux 的 read-1,write-2,executable-4 来句例子，大家耍过 linux 的都知道，ls -l 这个指令就可以显示出 linux 的详细权限，说一下这样 1 读 2 写 4 执行的原理，因为这里也利用了数学的一点小知识：

一个 byte=8bit, 可以表示的范围是 0-2^8-1，这一个 byte 的值如果是 0，表示没有任何权限，如果是 1 表示只有读的权限，如果是 2 表示只有写的权限，如果是 3 表示有读写权限，以此类推。

这是 Linux 的权限管理原理三位表（实际 Linux 这部分的权限管理只用了三位，不是一个 Byte）：

那为啥这里的权限管理这麽明确那？原因是每一个的取值都是 2 的指数，说说这样的好处，这样每一个权限是否存在在 byte 中的值是唯一的，因为每个 2 的指数都是对应一个 bit 位，所以不会重复。

这样设计的好处是啥吗？  
首先，这样设计节约空间，在硬盘或者文件开辟较小的空间，然后就是位运算在 CPU 执行起来效率比普通运算要快的多，直接电位变化，很快得出运算结果。

然后就的分析真正的算法实现了

我这里的权限一共有 8 个之多，我首先要做的就是取消原来的权限表的外键关系，因为外键这是一对多的关系，在这里已经不再适用，并且如果我简单的在管理员表中添加几个字段来表示多权限，那样看起来有些冗余，所以这里的权限字段还是维持一个字段不变，然后根据不同的值确定他具体具备哪些权限。

具体设计如下：

1 - 提案权限 (2^0)  
2 - 学院初审权限 (2^1)  
4 - 学校初审权限 (2^2)  
8 - 学校复审权限 (2^3)  
16 - 学校终审权限 (2^4)  
32 - 网站管理员权限 (2^5)  
64 - 相关部门权限 (2^6)  
128 - 牵头办理部门权限 (2^7)

你可以当我是在假设这些权限，没必要具体理解他，如果是上面这几个权限，只需要一个 Byte 就够了（八位）

最初的权限默认是 1，就是只有提案权限，然后就是重头戏，权限的动态管理：

增加权限：如给他学院初审权限只需要在原来权限或运算 2 就是行了（原来权限 | 2）

增加多个权限：原来权限 | 2|4|8 ，这个值就同时具有了学院，学校初审，学校复审的权限。

删除某个权限：只要让原来权与非一个权限就是 OK(原来权限 ^2, 就是删除了 2 的权限)

删除多个权限：只要原来权限同时与非多个权限就是 OK 了（原来权限 &~2&~4, 就是删除原来权限中的 2，4 权限）

分离出具要的权限：只要让权限集与 2 的指数，等于某权限项的就是拥有的权限

for i in range(64):   
if privilege & 2\*\*i == 2\*\*i:  
privilegelist.append(i)

简单的是现实就是加权限就是采用加法，减权限就是采用减法，但是这里的直接采用加减并不提倡，原因是 1. 加减法效率低，2. 加减法容易溢出，比如减的权限权限本来就是不存在的权限，就会报错

注意的问题：  
1. 在 mysql 等，其中 bigint 就是 8 字节，最多可以设置八个权限的组合（8×8-1 种权限）  
2.int 就只能设置 4 种权限共 8x4-1 种权限组合

最后说点前台修改数据然后后台修改权限的思路:

简单的几个 checkBox 代表不同的权限，注意这里的 CheckBox 也是按照原有的权限范围循环出来的，

比如权限范围是 2^0 ~ 2^7 其实就似乎对应 0，1，2，4，8，16，32，64，128 这几个数，然后到权限表中查到这几个数对应的中文名字在 checkBox 中打印出来，更新的时候根据每一的值进行循环或，这样权限集就是修改后的结果了，呵呵

这样后台权限页面的控制也瞬间变得简单了，直接几个大的模板页面就是 OK 了，当然这时候的模板页面就要设计的复杂一些，每个功能标签都是根据有无权限项循环打印出来的

这种按照位运算区分权限的思路是通用的，并且这里从数据库设计到前台实现都扯了一遍，希望您能有点收获。 
 [https://blog.csdn.net/l_f0rm4t3d/article/details/22223813?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control](https://blog.csdn.net/l_f0rm4t3d/article/details/22223813?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control) 
 [https://blog.csdn.net/l_f0rm4t3d/article/details/22223813?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control](https://blog.csdn.net/l_f0rm4t3d/article/details/22223813?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromMachineLearnPai2%7Edefault-3.control)
