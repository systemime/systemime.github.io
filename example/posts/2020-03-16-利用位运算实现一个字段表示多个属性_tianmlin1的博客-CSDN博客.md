---
title: 利用位运算实现一个字段表示多个属性_tianmlin1的博客-CSDN博客
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

## 前言

在数据库设计中，经常出现这样一种场景，如：某个系统的用户表，现阶段用户存在【是否新手】、【是否风险评测】、【是否实名认证】、【是否投资】等四个**并存**的属性，那么你会怎么设计表结构呢，在用户表定义四个字段？当然这样肯定是可行的，但是你设想这样一个问题，随着业务的扩展，用户可能会增加其他的属性比如【是否 vip】等等属性，那岂不是还需要 alter 用户表结构，这种修改表结构不仅影响性能同时修改的地方很多，维护成本比较高。

这里提供一种优雅的设计，通过一个字段来维护多个并存的属性。

## 设计思路

### 数据库表

用户表不用设计五个字段表示五种属性，用一个 user_propery 字段来表示用户属性，数据类型采用 bigint，因为 bigint 对应的是 java 中的 long 类型，long 类型的最大值是 2^63，也就是用 long 类型最多可以并行表示 63 个位状态，也就是可以同时表示 63 个并行的用户属性。

### 用户属性枚举

定义一个枚举类，如下：

````null
package com.whfax.user.inf.constants;public enum UserProperty {    OPEN_ACCOUNT_FLAG(1, "1-开户成功"),    FDD_FLAG(1 << 1, " 2-法大大签约成功"),    RISK_FLAG(1 << 2, "4-风险测评成功"),    NEW_FLAG(1 << 3, "8-新手");    UserProperty(long value, String desc) {public static String getDesc(long value) {for (UserProperty property : UserProperty.values()) {if (property.value == value) {public static boolean isOpenAccountFlag(long flag) {return (flag & OPEN_ACCOUNT_FLAG.value) == OPEN_ACCOUNT_FLAG.value;public static boolean isFddFlag(long flag) {return (flag & FDD_FLAG.value) == FDD_FLAG.value;public static boolean isRiskFlag(long flag) {return (flag & RISK_FLAG.value) == RISK_FLAG.value;public static boolean isNewFlag(long flag) {return (flag & NEW_FLAG.value) == NEW_FLAG.value;```

这种方式扩展性就很好了，后面随着业务扩展，只需要在这个枚举类中增加对应的属性就行了。

### dao层操作用户属性

*   增加用户属性操作

```null
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)public void addUserProperty(long userId, UserProperty userProperty) {        log.info("addUserProperty enter,userId:{}--userProperty:{}", userId, userProperty);        String update = "update " + TableNameContants.TABLE_USER                        + " set user_property=(user_property|?) ,update_time=now() where id=?";        List<Object> para = new ArrayList();        para.add(userProperty.value);        log.info("update:{}--para:{}", update, para.toArray());        mainDao.update(update, para.toArray());```

*   剔除用户属性

```null
@Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)public void removeUserProperty(long userId, UserProperty userProperty) {        log.info("removeUserProperty enter,userId:{}--userProperty:{}", userId, userProperty);        List<Object> para = new ArrayList();        String update = "update " + TableNameContants.TABLE_USER                        + " set user_property=(user_property&(~?)) ,update_time=now() where id=?";        para.add(userProperty.value);        log.info("update:{}--para:{}", update, para.toArray());        mainDao.update(update, para.toArray());```

### 说明

*   可能有的小伙伴就问了，为啥每种属性都要定义成2的n次幂，这是因为每一个位上都是不同的，表示的结果是唯一的，二进制【|】运算就相当于十进制的加法，m|n<=(m+n)，等式成立的条件就是m和n都是2的整数次方；
*   (~m)&n，可以剔除n中包含m的位；
*   判断n中是否包含m可以使用，m&n的值和m做判断，若相等则包含，否则则不包含。
*   上面的设计有诸与易扩展性等优点，但是也有一定的缺陷。其一就是针对两个互斥的属性，不太适用；其二是，可读性较差，比如user\_property中存储的是6，但是枚举值并没有6，还需要做额外的判断，才能知晓这条数据包含哪些属性。 
 [https://blog.csdn.net/tianmlin1/article/details/101704042?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control](https://blog.csdn.net/tianmlin1/article/details/101704042?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control) 
 [https://blog.csdn.net/tianmlin1/article/details/101704042?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control](https://blog.csdn.net/tianmlin1/article/details/101704042?utm_medium=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control&dist_request_id=&depth_1-utm_source=distribute.pc_relevant.none-task-blog-2%7Edefault%7EBlogCommendFromBaidu%7Edefault-5.control)
````
