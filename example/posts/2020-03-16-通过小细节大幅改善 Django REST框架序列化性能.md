---
title: 通过小细节大幅改善 Django REST框架序列化性能
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

—我们是如何将序列化时间减少到原来的 99% 的！By Hakibenita

当开发人员选择 Python、Django 或 Django Rest 框架时，通常并不是因为它们的性能非常快。Python 一直是 “舒适” 的选择，当你更关心人体工程学而不是略去某些过程的几微秒时，你就会选择 Python。

人体工程学没有什么问题。大多数项目并不真正需要那微秒级别的性能提升，但是它们确实需要快速交付高质量的代码。

所有这些并不意味着性能不重要。正如这个故事告诉我们的那样，只需稍加注意并进行一些小的改变，就可以显著提高性能。

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLibzP3hgKzfY57sljs1lsLDU0rqHYjibrXR9w8eth8QdXLb9eBnMYdkFg/640?wx_fmt=jpeg)

模型序列化器性能  

不久前，我们注意到一个主要 API 端点的性能非常差。该端点从一个非常大的表中获取数据，因此我们自然而然地假设问题一定在数据库中。

当我们注意到即使是很小的数据集也会有很差的性能时，我们开始查看应用程序的其他部分。这个旅程最终将我们带向了 Django Rest 框架（DRF）序列化器。

> 版本: 在基准测试中，我们使用 Python 3.7、Django 2.1.1 和 Django Rest 框架 3.9.4。

简单的函数

序列化器用于将数据转换为对象，以及将对象转换为数据。这是一个简单的函数，因此我们来编写一个接受一个 User 实例并返回一个字典的函数:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxkR311leJ8ZDUvA42E6C9lrLS9BbLicylqCzOEicibufiaWv3cT5dtX8aew/640?wx_fmt=jpeg)

创建一个用户以便在基准测试中使用：

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxClhcjlbd0Zft2A37ib471zFoechPJQNSdveP1CxIIDtuuFELtgG3GIw/640?wx_fmt=jpeg)

对于我们的基准测试，我们将使用 cProfile。为了消除数据库等外部影响，我们提前获取一个用户，并对其进行 5000 次序列化:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxwvFR9jRuC1fsjIwx37iaMxyr75Oae8EDsmqWaMsibqaopnuqRcP7pIPw/640?wx_fmt=jpeg)

这个简单的函数花了 0.034 秒来序列化一个用户对象 5000 次。

ModelSerializer

Django Rest 框架 (DRF) 附带了一些实用程序类，即 ModelSerializer。

内置 User 模型的一个 ModelSerializer 可能是这样的:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsx2icQbSwU34kJM7lmjW3tAv8VfUzgiaL8xrhynC1bUMJreibbHI3bNp9GA/640?wx_fmt=jpeg)

和之前一样运行相同的基准测试：

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsx3f2ia0Au1sibVyyExskeKN45VVvpDfEcOhsdt4vcsjicGUibfl5HXYeAcw/640?wx_fmt=jpeg)

DRF 序列化一个用户 5000 次需要 12.8 秒，或者说，仅序列化一个用户需要 390 毫秒。这比普通的函数慢 377 倍。

我们可以看到在 functional.py 中花费了大量的时间。ModelSerializer 使用了 django.utils.functional 中的 lazy 函数来评估验证情况。Django 的 verbose name 等也使用到了 lazy，DRF 也对它进行了评估。这个函数似乎在拖累序列化器。

### **只读 ModelSerializer**

ModelSerializer 仅为可写字段添加字段验证。为了度量验证的效果，我们创建了一个 ModelSerializer，并将所有字段标记为只读 (read only):

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxdodqHUg4Owm5LlU1W6ibouFicnOLUKsqPnT6E5W8xDY4M5wYqvMY9Oibw/640?wx_fmt=jpeg)

当所有字段是只读时，则不能使用序列化器创建新的实例。我们来运行这个只读序列化器的基准测试:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxKLMztz52qWRQEgbGJCH0DiaDhaRjrqJfHMLLdt1eju2SqaibxVjt5iatg/640?wx_fmt=jpeg)

只有 7.4 秒。与可写的 ModelSerializer 相比，提升了 40%。

在基准测试的输出中，我们可以看到在 field_mapping.py 和 fields.py 中花费了大量时间。这些都与 ModelSerializer 的内部工作方式有关。在序列化和初始化过程中，ModelSerializer 使用大量元数据来构造和验证序列化器字段，当然这是有代价的。

### “一般”Serializer

在下一个基准测试中，我们希望准确地测量 ModelSerializer“花费” 了我们多少时间。我们先为 User 模型创建一个 “一般”Serializer:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxA9e9N0H0rteflD31p5D4EGmvPhLBD9L19hPBMNDFs23zqe9lbe9iaaA/640?wx_fmt=jpeg)

对这个 "一般" 序列化器运行同样的基准测试:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxXQibxUrKw7Ljqet8YGicsrud9DKlLrBXTeOnespicBqJdHianrK3jsNm1w/640?wx_fmt=jpeg)

这就是我们期待已久的飞跃!

“一般” 序列化器只花了 2.1 秒。这比只读的 ModelSerializer 快 60%，比可写的 ModelSerializer 惊人地快 85%。

此时，我们可以很明显地看到 ModelSerializer 并不 “便宜”!

### 只读 “一般”Serializer

在可写的 ModelSerializer 中，验证过程花费了大量的时间。通过将所有字段标记为只读，我们可以使它更快。“一般” 序列化器并不定义任何的验证，因此将字段标记为只读并不会使它更快。我们要确保:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsx3OUCTEK4ZYWiaYZmjWxtX89licSicuiaDLM6jH7AURMqWy0fkGmwepibN0Q/640?wx_fmt=jpeg)

并对一个用户实例运行基准测试：

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxYQGL2HfMDMYn26QrjYtBpk6gELCGgDqREOiaZQQtibjscEZxTSF3g8icQ/640?wx_fmt=jpeg)

和预期的一样，与 “一般” 序列化器相比，将字段标记为只读并没有带来太大区别。这就再一次肯定了时间主要花在从模型的字段定义派生的验证部分上。

### 结果摘要

以下是迄今为止的运行结果的摘要:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxbKVrDmY3je0TqWBJlHY5WfF1tAEjSia7ia80hC6q34gxlbyjCvnh1xuw/640?wx_fmt=jpeg)

## 之前的工作

目前，人们写了很多关于 Python 中的序列化性能的文章。正如预期的那样，大多数文章都关注于使用 select_related 和 prefetch_related 等技术来改进 DB 访问。虽然这两种方法都可以有效地提高 API 请求的总体响应时间，但它们并没有解决序列化本身的问题。我怀疑这是因为没有人想到序列化会很慢。

其他只关注序列化的文章通常会避免修复 DRF，而是去激发新的序列化框架，如 marshmallow 和 serpy。甚至有一个站点专门比较 Python 中的序列化格式。为了节省你的点击，DRF 总是排在最后。

2013 年年末，Django Rest 框架的创建者 Tom Christie 写了一篇文章，讨论了 DRF 的一些缺点。在他的基准测试中，序列化过程占处理单个请求总时间的 12%。在总结中，Tom 建议不要总是使用序列化:

"你不需要总是使用序列化器。" 对于性能关键的视图，你可以考虑完全删除序列化器，并在数据库查询中简单地使用. values()。

正如我们在前面看到的，这是一个可靠的建议。

## 为什么会这样？

在第一个使用 ModelSerializer 的基准测试中，我们看到大量的时间花费在 functional.py 中，更具体地说是在 lazy 函数中。

### 修复 Django 中的 lazy

Django 在内部使用 lazy 函数来处理许多事情，比如 verbose name（冗长的名称）、模板等。其源代码中将 lazy 描述如下:

对一个函数调用进行封装，并将其作为一个在该函数的结果上进行调用的方法的代理。在调用结果上的一个方法之前，不会对函数进行计算。

lazy 函数通过创建一个结果类的代理来实现它的魔力。要创建这个代理，lazy 函数会遍历这个结果类 (及其超类) 的所有属性和函数，并创建一个包装器类，该类仅在实际使用函数结果时才会对函数进行计算。

对于大型结果类，创建代理可能需要一些时间。因此，为了加快速度，lazy 会缓存该代理。但事实证明，代码中的一个小疏忽会完全破坏这个缓存机制，使得 lazy 函数非常非常慢。

为了了解在没有适当缓存的情况下，lazy 函数有多慢，让我们使用一个简单的函数，它返回一个 str （结果类)，比如 upper。我们选择 str 是因为它有很多方法，所以为它设置一个代理需要一段时间。

为了建立一个基线，我们直接使用 str.upper 进行基准测试，不使用 lazy 函数:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxcuZoJrZkbL5rtuLgtlibWOXia2rlCgYautVtfSH8Hnbwfoo2Xnygn0Ng/640?wx_fmt=jpeg)

现在就是惊人的部分，完全相同的函数，但这次使用 lazy 进行了包装:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxiaUaH4rey5riajxY3xNEcaIVbzef2IIpOvHhfjcFLjkeibOFia7OEhJlTA/640?wx_fmt=jpeg)

没有任何错误! 使用 lazy 时，将 5000 个字符串转换为大写需要 1.139 秒，而直接使用相同的函数只需要 0.034 秒。快将近 33.5 倍。

这显然是一个疏忽。开发人员清楚地意识到缓存代理的重要性。因此，他们发布了一个 PR，并在不久后进行了合并 (有关不同之处请看这里)。一旦发布，这个补丁将使 Django 的整体性能更好。

### 修复 Django Rest 框架

DRF 对验证和字段冗长名称使用了 lazy 函数。当所有这些惰性评估结果放在一起时，你会明显感觉运行要慢。

Django 中对 lazy 的修复在进行微小修复后本来也可以解决 DRF 的这个问题，但尽管如此，开发人员还是对 DRF 进行了一个单独的修复，用更有效的东西替代 lazy。

要查看更改的效果，请安装 Django 和 DRF 的最新版本:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsx9WrouRuCf3lyGndv1iakKEicvicewsoG6d1GdepiabwSiarK6c5dZGR3ofw/640?wx_fmt=jpeg)

在应用了这两个补丁之后，我们再一次运行同样的基准测试。这些是并列的结果:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxSTdufAjX17GSYV7Ic6dtqutKyUuPibO3ia3jph1BQIpDflELVsjWicqbg/640?wx_fmt=jpeg)

我们来总结一下 Django 和 DRF 的变化结果:

-   可写 ModelSerializer 的序列化时间被降低了一半。  
-   只读 ModelSerializer 的序列化时间被降低了三分之一。
-   和预期的一样，在其它的序列化方法中没有明显的差异。

## 结论

我们从这个实验中得出的结论是：

1\. 一旦这些补丁正式发布，就升级 DRF 和 Django。两个 PR 的补丁都已合并，但尚未发布。

2\. 在性能关键的端点中，使用 “一般” 序列化器，或者根本不使用。

我们有几个地方的客户端正在使用 API 来获取大量数据。API 只用于从服务器读取数据，因此我们决定根本不使用 Serializer，而是使用内联序列化进行替代。

3\. 不用于写入或验证的 Serializer 字段应该是只读的。

正如我们在基准测试中所看到的，验证的实现方式使它们变得昂贵，而将字段标记为只读可以消除不必要的额外成本。

### 福利: 强制形成好习惯

为了确保开发人员不会忘记设置只读字段，我们添加了一个 Django 检查，以确保所有的 ModelSerializer 都设置了 read_only_fields:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxJccUrKEXgWPvkrv3uRicqvP1HyL7BokRSZzXocNxQtdpXDb1ynHboIg/640?wx_fmt=jpeg)

有了这个检查，当开发人员添加一个序列化器时，她还必须设置 read_only_fields。如果这个序列化器是可写的，read_only_fields 可以设置为一个空元组。如果开发人员忘记设置 read_only_fields，她将得到以下错误:

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoBibpFQIbdia3unuN1Y0cNAsxE7BY5BBKDWrYIicjs6KOSDojBTq3gzGIPby0T8lh1t7dWqNGtrpcKCg/640?wx_fmt=jpeg)

我们经常使用 Django 检查，以确保没有遗漏任何内容。你可以在《我们如何使用 Django 系统检查框架》这篇文章中找到更多的其他有用的检查。

英文原文：[https://hakibenita.com/django-rest-framework-slow](https://hakibenita.com/django-rest-framework-slow)

译者：野生大熊猫

**相关阅读**  

[Django REST Framework 教程 (2): 序列化器介绍及以博客为例开发基于函数视图的 API](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484783&idx=1&sn=6506aeaf6319ab03711f3af1b7906ead&chksm=a73c6557904bec4121ed36c63be2eb0cc52a57df616799ba252c69f62bedb6e3af3273be0fcd&scene=21#wechat_redirect)  

[Django REST Framework 教程 (4): 玩转序列化器 (Serializer)](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484934&idx=1&sn=49a622824a0baf78455a84277bd14eaa&chksm=a73c663e904bef28b17a940bea7e1345cb74b62b50ac1ba4d5203417ba34611a3c80e39946ee&scene=21#wechat_redirect)  

[Django Rest Framework 序列化关系模型举例 - 好文推荐](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247485175&idx=1&sn=10052c011ea2e747f7065171d995d0df&chksm=a73c66cf904befd9269ee11160c085728314129b2a8b8ec8328be63eb5dbababb05db6f17164&scene=21#wechat_redirect)  

[Django 基础 (12): 深夜放干货。QuerySet 特性及高级使用技巧，如何减少数据库的访问，节省内存，提升网站性能。](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247483949&idx=1&sn=bc4c8929d5f8e99a769c63f2208ed6eb&chksm=a73c6215904beb033f3277e3d1a98aaeece313792649cf96eea77cb1ee3d06bb493d06bc0c99&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoD7CzxpEyZf5SiagL9zpdVtAiaD2Zab0HcohkicTOWwoXk7RoXXUaFb46nURm46vFicic9EWW9ianMvpzLg/640?wx_fmt=png) 
 [https://mp.weixin.qq.com/s/8i1S27Si3FoA9LSWk_EIVg](https://mp.weixin.qq.com/s/8i1S27Si3FoA9LSWk_EIVg)
