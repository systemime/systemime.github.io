---
layout: post
title:  "浪潮服务器RAID 磁盘状态foreign解决方案"
subtitle: '本文介绍浪潮服务器RAID磁盘出现状态以及WebBIOS相关配置解释'
date:   2019-11-28 20:35:13
tags: RAID WebBIOS
color: rgb(154,133,255)
cover: '../assets/test.png'
---  

## 解决方案记录

[Ctrl+H 浪潮Raid配置文档](https://github.com/systemime/my_image/blob/master/Ctrl%2BH%20%E6%B5%AA%E6%BD%AERaid%E9%85%8D%E7%BD%AE%E6%96%87%E6%A1%A3%20-%20%E5%BC%A0%E5%86%B2andy%20-%20%E5%8D%9A%E5%AE%A2%E5%9B%AD.pdf)  

[RAID 磁盘状态为foreign，怎么变成ready](https://github.com/systemime/my_image/raw/master/RAID%20%E7%A3%81%E7%9B%98%E7%8A%B6%E6%80%81%E4%B8%BAforeign%EF%BC%8C%E6%80%8E%E4%B9%88%E5%8F%98%E6%88%90ready%20-%20BigBao%E7%9A%84%E5%8D%9A%E5%AE%A2%20-%20%E5%8D%9A%E5%AE%A2%E5%9B%AD.pdf)  

[浪潮英信服务器NF5270M3用户手册V1.0](https://github.com/systemime/my_image/raw/master/%E6%B5%AA%E6%BD%AE%E8%8B%B1%E4%BF%A1%E6%9C%8D%E5%8A%A1%E5%99%A8NF5270M3%E7%94%A8%E6%88%B7%E6%89%8B%E5%86%8CV1.0.pdf)  

[运维日常之机房浪潮服务器硬盘红灯亮起，服务器一直响，raid磁盘红色。。。故障解决方法](https://github.com/systemime/my_image/raw/master/%E8%BF%90%E7%BB%B4%E6%97%A5%E5%B8%B8%E4%B9%8B%E6%9C%BA%E6%88%BF%E6%B5%AA%E6%BD%AE%E6%9C%8D%E5%8A%A1%E5%99%A8%E7%A1%AC%E7%9B%98%E7%BA%A2%E7%81%AF%E4%BA%AE%E8%B5%B7%EF%BC%8C%E6%9C%8D%E5%8A%A1%E5%99%A8%E4%B8%80%E7%9B%B4%E5%93%8D%EF%BC%8Craid%E7%A3%81%E7%9B%98%E7%BA%A2%E8%89%B2%E3%80%82%E3%80%82%E3%80%82%E6%95%85%E9%9A%9C%E8%A7%A3%E5%86%B3%E6%96%B9%E6%B3%95%20-%20Rich%E4%B8%83%E5%93%A5%20-%20%E5%8D%9A%E5%AE%A2%E5%9B%AD.pdf)  
