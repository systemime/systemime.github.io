---
title: 为什么不要轻易使用 Chrome 复制的 XPath？
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

![](https://mmbiz.qpic.cn/mmbiz_jpg/LLRiaS9YfFTPdzarAhulgpZeYMbpucH0Gh46VRxL4Keb7VyEqAiamTdfnDbeeFIEmwbmVMbs58oQypl7jRe5v61A/640?wx_fmt=jpeg)

作者：kingname

来源：未闻 Code

有一些同学在写爬虫的时候，喜欢在 Chrome 开发者工具里面直接复制 XPath，如下图所示：  

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibe1FsfDRsCNA8HqSlXKN2Tya6CKqdibnnOzkQcERXbaDKZY40kgtNhh4w/640?wx_fmt=png)

他们觉得这样复制出来的 XPath 虽然长了点，但是工作一切正常，所以频繁使用。  

但我希望大家不要过于依赖这个功能。因为它给出的结果仅作参考，有时候并不能让你提取出数据。我们来看一个例子。

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeRXIfYxFTuibELpbsuVKV49y1lAc675DWF8RsyPDQM7LjQw97LwkiagLw/640?wx_fmt=png)

这是一个非常简单的 HTML 页面，页面中有一个表格，表格有一列叫做`电话`。我现在想把这里面的 5 个电话提取出来。如果直接使用 Chrome 的复制 XPath 的功能，我们可以得到下面这个 XPath：

    /html/body/div/table/tbody/tr[3]/td[4]

这实际上对应了`刘小三`这一行的电话字段。那么，我们去掉`tr`后面的数字，似乎就能覆盖到所有行了：

    /html/body/div/table/tbody/tr/td[4]/text()

在 XPath Helper 上面运行看看效果，确实提取出了所有的电话号码，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLiben2Zfiarfv8hAAMicSELWKPCkAibUiad5DsNXD8HgcVtma2P3cT99m1bajw/640?wx_fmt=png)

但如果你使用 requests 来爬这个网页，然后使用 XPath 提取电话号码，你就会发现什么都提取不到，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeatCpGCbW49UJeh7cSgALkden9sX238ic89rkYSfsT9O3k920hib876CQ/640?wx_fmt=png)

你可能会想，这应该是异步加载导致的问题。表格里面的数据是通过 Ajax 后台加载的，不在网页源代码里面。

那么我们打印看看网页的源代码：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeIGlpLoY7Ix45pjKleSV1OdXu9a3Sg8tesE6bZvfqkPKiaZVpJGOeTBw/640?wx_fmt=png)

大家可以看到，数据就在网页源代码里面，那为什么我们在 Chrome 上面通过 XPath  Helper 就能提取数据，而用 requests 就无法提取数据？

实际上，如果大家仔细观察从 Chrome 中复制出来的 XPath，就会发现它里面有一个`tbody`节点。但是我们的网页源代码是没有这个节点的。

这就要说到 Chrome 开发者工具里面显示的 HTML 代码，跟网页真正的源代码之间的区别了。很多人分不清楚这两者的区别，所以导致写出的 XPath 匹配不到数据。

当我们说到`网页源代码`的时候，我们指的是在网页上右键，选择 “显示网页源代码” 按钮所查看到的 HTML 代码，如下图所示：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeNricZib2guW1MwWhpicr0jQZYpIswt8vpVxhqH9Oo8w0O5pPEL4xjxUtQ/640?wx_fmt=png)

这个查看源代码的页面长成下图所示的这样：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeUNiaUj4Vohuul68ImXia4ia3l8wUTmLguQBiaFPaf24HTluHXPibV6y9WjA/640?wx_fmt=png)

注意地址栏，是以`view-source:`开头的。这才是网页真真正正的源代码。

而 Chrome 的开发者工具里面的`Element`标签所显示的源代码，长成下面这样：

![](https://mmbiz.qpic.cn/mmbiz_png/ohoo1dCmvqf4kAkGg9ZCdKo0f0liaiaLibeNia6SRtoQ5PcCLZ6CYSo8rWlBKhNLanwKoJY8Z9GN8jD3yjibnbKao1Q/640?wx_fmt=png)

这两个地方的 HTML 代码**可能是**不一样的，而且在现代化的网站中，这两个地方的 HTML**大概率是不一样的**。当我们使用 requests 或者 Scrapy 时，拿到的是第一种情况的源代码，这才是网页真正的源代码。而在开发者工具里面的 HTML 代码，是经过 Chrome 浏览器修饰甚至大幅度增删后的 HTML 代码。当网站有异步加载时，JavaScript 可以轻易在这里增加、删除非常多的内容。即使网站没有异步加载，如果网站原始的 HTML 代码编写不够规范，或者存在一些错漏，那么 Chrome 浏览器会自动纠错和调整。

以本文的例子来说，在 HTML 的官方规范里面，表格的正文确实应该包在`<tbody></tbody>`标签里面。但现在大多数情况下，前端开发者都会省略这个标签，所以真正的源代码里面是没有这个标签的。而 Chrome 会自动识别到这种情况，然后自动加上这个标签，所以在开发者工具里面看到的 HTML 代码是有这个标签的。

当你写爬虫的时候，不仅仅是 Chrome 开发者工具里面复制的 XPath 仅作参考，甚至这个开发者工具里面显示的 HTML 代码也是仅作参考。你应该首先检查你需要的数据是不是在真正的源代码里面，然后再来确定是写 XPath 还是抓接口。如果是写 XPath，那么更应该以这个真正的源代码为准，而不是开发者工具里面的 HTML 代码。

![](https://mmbiz.qpic.cn/mmbiz/cZV2hRpuAPiaJQXWGyC9wrUzIicibgXayrgibTYarT3A1yzttbtaO0JlV21wMqroGYT3QtPq2C7HMYsvicSB2p7dTBg/640?wx_fmt=gif)

**Python 猫技术交流群开放啦！**群里既有国内一二线大厂在职员工，也有国内外高校在读学生，既有十多年码龄的编程老鸟，也有中小学刚刚入门的新人，学习氛围良好！想入群的同学，请在公号内回复『**交流群**』，获取猫哥的微信（谢绝广告党，非诚勿扰！）~

**还不过瘾？试试它们**

**▲[Python 最佳代码实践：性能、内存和可用性！](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247491581&idx=2&sn=997772836d9c193bcbd4b62faa3b2cbe&chksm=fa585878cd2fd16eb441e66cd82db48ab67a2776d32ef4f1d554ca6e5f93b4a5f5470fa3c1fc&scene=21#wechat_redirect)**

**▲[长文干货：多图详解 10 大高性能开发核心技术](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247486463&idx=1&sn=53a1a4f2503adf4a394086e3999de361&chksm=fa584c7acd2fc56c806d38c9ab76728058956e99be4b0e0504ce7d2cac47873c3399698fbb26&scene=21#wechat_redirect)**

**▲[如何用十条命令在一分钟内检查 Linux 服务器性能？](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247484880&idx=1&sn=b4da077ab87806474d261f80d347b04d&chksm=fa584255cd2fcb43540bdc4fb7b996781089299022937b6f3adaaefde090b6f47c6ffa5196a6&scene=21#wechat_redirect)**

**▲[Python 内存分配时的小秘密](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247484562&idx=1&sn=62bdb35df55000f982d34b82ac7d62c1&chksm=fa584317cd2fca015c78130ccd67aca85459b1a0534aadef887168cb197446ed75da75578b83&scene=21#wechat_redirect)**

**▲[Python 进阶：enum 模块源码分析](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247485325&idx=1&sn=3fd26870a32901e1c70a63dc111bb6c3&chksm=fa584008cd2fc91e36d24524a5775794cc8e06afe8246da2dbb8b3024b6cedf7846a939609ed&scene=21#wechat_redirect)**

**▲[在滴滴和头条干了 2 年开发，分享几点感悟！](http://mp.weixin.qq.com/s?__biz=MzUyOTk2MTcwNg==&mid=2247491398&idx=1&sn=1520b6fd4f348d92e0e9a3b03a4f9970&chksm=fa5858c3cd2fd1d52e66dfa969e60c537a247ffbf452c76124b590ca32bc4d3f8a9f368e4e9c&scene=21#wechat_redirect)**

**如果你觉得本文有帮助**

**请慷慨分享 \*\***和 \***\* 点赞 \*\***，感谢啦 \***\*！** 
 [https://mp.weixin.qq.com/s/-ot_4zRUv82rI_zot6kbGw](https://mp.weixin.qq.com/s/-ot_4zRUv82rI_zot6kbGw) 
 [https://mp.weixin.qq.com/s/-ot_4zRUv82rI_zot6kbGw](https://mp.weixin.qq.com/s/-ot_4zRUv82rI_zot6kbGw)
