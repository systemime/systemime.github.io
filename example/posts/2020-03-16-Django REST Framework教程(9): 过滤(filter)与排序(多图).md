---
title: Django REST Framework教程(9)：过滤(filter)与排序(多图)
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

在前面的 DRF 系列教程中，我们以博客为例介绍了序列化器 (Serializer), 并使用基于类的视图 APIView 和 ModelViewSet 开发了针对文章资源进行增删查改的完整 API 端点，并详细对权限、认证(含 jwt 认证) 和分页进行了总结与演示。在本篇文章中我们将向你演示如何在 Django REST Framework 中对分页结果进行进一步过滤和排序。

![](https://mmbiz.qpic.cn/mmbiz_jpg/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLCUQ1opzFquL7EgMuVHNWAf04ZGLVcUke25RTVZbnopTrbZFzzfmnzw/640?wx_fmt=jpeg)

前面教程中当你发送 GET 请求到 / v1/articles?page=2 时可以得到下面返回的分页数据列表。现在我们希望对结果进行进一步过滤，比如返回标题含有关键词 django 的文章资源列表。我们到底该怎么做呢? 本例中小编我将演示三种方法, 你可以根据实际项目开发需求去使用。  

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoDYvnjPq512jbjdmOUAQiamjU7FbOY7Qlo2hvcZa9At55cFLT7sREXqIXCNkzx0RwoBL9BxloQYZcg/640?wx_fmt=png)

**方法一：重写 GenericsAPIView 或 viewset 的 get_queryset 方法**

此方法不依赖于任何第三方包, 只适合于需要过滤的字段比较少的模型。比如这里我们需要对文章 title 进行过滤，我们只需要修改 ArticleList 视图函数类即可。

```python
# blog/views.py

from rest_framework import generics
from rest_framework import permissions
from .permissions import IsOwnerOrReadOnly
from .pagination import MyPageNumberPagination

class ArticleList(generics.ListCreateAPIView):
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = MyPageNumberPagination

    def get_queryset(self):
        keyword = self.request.query_params.get('q')
        if not keyword:
            queryset = Article.objects.all()
        else:
            queryset = Article.objects.filter(title__icontains=keyword)
        return queryset

    # associate user with article author.
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

修改好视图类后，发送 GET 请求到 / v1/articles?page=2&q=django, 你将得到所有标题含有 django 关键词的文章列表，这里显示一共有 3 条结果。

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLB3WvaecmWdHMGktMiaOibOzqOfuTvsw4MiaOA4yWwfD5UmTzlEG0ggCWA/640?wx_fmt=png)

当一个模型需要过滤的字段很多且不确定时 (比如文章状态、正文等等), 重写 get_queryset 方法将变得非常麻烦，更好的方式是借助 django-filter 这个第三方库实现过滤。  

**方法二：使用 django-filter**

`django-filter`库包含一个`DjangoFilterBackend`类，该类支持 REST 框架的高度可定制的字段过滤。这也是小编推荐的过滤方法, 因为它自定义需要过滤的字段非常方便, 还可以对每个字段指定过滤方法 (比如模糊查询和精确查询)。具体使用方式如下：

1. 安装 django-filter

```nginx
pip install django-filter
```

2. 把 django_filters 添加到 INSTALLED_APPS

```makefile
INSTALLED_APPS = [
    ...,
    django_filters,
]
```

3. 自定义 FilterSet 类。这里我们自定义了按标题关键词和文章状态进行过滤。

_# blog/filters.py(新建)_

```python
import django_filters
from .models import Article

class ArticleFilter(django_filters.FilterSet):
    q = django_filters.CharFilter(field_name='title', lookup_expr='icontains')

    class Meta:
        model = Article
        fields = ('title', 'status')
```

如果你对 django-filter 中自定义 FilterSet 类比较陌生的话，可以先阅读下面两篇文章：

-   [Django-filter 教程详解: 从安装使用到高阶美化分页 - 大江狗精品](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484288&idx=1&sn=14321a3373daa3a23575180452b9121e&chksm=a73c63b8904beaaeb2e4bebc3d172ef3a2ee24141a5279bcc83ea0f7030f879cc45d2b40422e&scene=21#wechat_redirect)
-   [Django 3.0 实战: 仿链家二手房信息查询网 (附 GitHub 源码)](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484686&idx=1&sn=8594fe93b71d1cce6a880c3d556aa097&chksm=a73c6536904bec209a95a05f28329c4bec8dac843945c402a63acc7131fc707840f7e8c00a4e&scene=21#wechat_redirect)  

4. 将自定义 FilterSet 类加入到 View 类或 ViewSet，另外还需要将 DjangoFilterBackend 设为过滤后台，如下所示：

```properties
# New for django-filter
from django_filters import rest_framework
from .filters import ArticleFilter

class ArticleList(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = MyPageNumberPagination

    # new: filter backends and classes
    filter_backends = (rest_framework.DjangoFilterBackend,)
    filter_class = ArticleFilter

    # associate request.user with author.
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
```

发送 GET 请求到 / v1/articles?page=2&q=django&status=p, 你将得到如下返回结果，只包含发表了的文章。

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLRU3T5mNdkQjibmOr3O6ToAprPCdeq4I96Ywn0EDko4owIGkCmibzicdVg/640?wx_fmt=png)

你还可以看到 REST 框架提供了一个新的 Filters 下拉菜单按钮，可以帮助您对结果进行过滤 (见上图标红部分)。

**方法三：使用 DRF 提供的 SearchFilter 类**

其实 DRF 自带了具有过滤功能的 SearchFilter 类，其使用场景与 Django-filter 的单字段过滤略有不同，更侧重于使用一个关键词对模型的某个字段或多个字段同时进行搜索。

使用这个类，你还需要指定 search_fields, 具体使用方式如下：

```python
from rest_framework import filters

class ArticleList(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = MyPageNumberPagination

    # new: add SearchFilter and search_fields
    filter_backends = (filters.SearchFilter, )
    search_fields = ('title',)

    # associate request.user with author.
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

```

发送 GET 请求到 / v1/articles?page=1&search=django, 你将得到如下结果。**注意**：这里进行搜索查询的默认参数名为? search=xxx。

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLXJsfMn6NabxxnqIuuIvtnbVETpNOvYyaB6xQOTpbiaj3m5THdYk5NBg/640?wx_fmt=png)

SearchFilter 类非常有用，因为它不仅支持对模型的多个字段进行查询，还支持 ForeinKey 和 ManyToMany 字段的关联查询。按如下修改 search_fields, 就可以同时搜索标题或用户名含有某个关键词的文章资源列表。修改好后，作者用户名里如果有 django，该篇文章也会包含在搜索结果了。

```ini
search_fields = ('title', 'author__username')
```

默认情况下，SearchFilter 类搜索将使用不区分大小写的部分匹配 (icontains)。你可以在 search_fields 中添加各种字符来指定匹配方法。

-   '^'开始 - 搜索。
-   '='完全匹配。
-   '@'全文搜索。
-   '$'正则表达式搜索。

例如：search_fields = ('=title',) 精确匹配 title。

前面我们详细介绍了对结果进行过滤的 3 种方法，接下来我们再看看如何对结果进行排序，这里主要通过 DRF 自带的 OrderingFilter 类实现。

**使用 DRF 的 OrderingFilter 类**

使用 OrderingFilter 类首先要把它加入到 filter_backends, 然后指定排序字段即可，如下所示：  

```properties
from rest_framework import filters

class ArticleList(generics.ListCreateAPIView):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    pagination_class = MyPageNumberPagination


    filter_backends = (filters.SearchFilter, filters.OrderingFilter,)
    search_fields = ('title',)
    ordering_fields = ('create_date')
```

发送请求时只需要在参数上加上? ordering=create_date 或者? ordering=-create_date 即可实现对结果按文章创建时间正序和逆序进行排序。

点击 DRF 界面上的 Filters 按钮，你还会看到搜索和排序的选项。  

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoAZ6xO9dc6ciblvNu7K51skLAle0obF0ykNb38ap7EBdx5KJ2Slib8dQicKEibyyRmSaGhOWqO3FFj0Fw/640?wx_fmt=png)

**注**：实际开发应用中 OrderingFilter 类，SearchFilter 类和 DjangoFilterBackend 经常一起联用作为 DRF 的 filter_backends，没有相互冲突。

**小结**

本文详细总结了 Django REST Framework 中如何对返回的响应数据进行过滤和排序，你都学到了吗? 下面我们将开始介绍 Django REST Framework 的限流和自定义响应数据格式，欢迎关注我们的微信公众号【Python Web 与 Django 开发】, 获取一手原创干货。

祝大家圣诞快乐!

大江狗

2020.12.25  

**热门阅读**

[Django REST Framework 教程 (8): 分页(Pagination) 详解](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247485151&idx=1&sn=458195b9ab27e5bc9b4232b5815a781b&chksm=a73c66e7904beff1792700114a8aa3dea5dea311c86ff381d6d6d73959cd37131346902167ae&scene=21#wechat_redirect)  

[Django REST Framework 教程 (7): 如何使用 JWT 认证 (神文多图)](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247485035&idx=1&sn=c437e8211f375e2e06de2498127e821a&chksm=a73c6653904bef458c2baffaf87d93960034b54e8a999b54548b5937116e6d40381360dcac28&scene=21#wechat_redirect)  

[Django REST Framework 教程 (4): 玩转序列化器 (Serializer)](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484934&idx=1&sn=49a622824a0baf78455a84277bd14eaa&chksm=a73c663e904bef28b17a940bea7e1345cb74b62b50ac1ba4d5203417ba34611a3c80e39946ee&scene=21#wechat_redirect)  

[Django REST Framework 教程 (1): 为什么要学习 DRF, 什么是序列化和 RESTful 的 API](http://mp.weixin.qq.com/s?__biz=MjM5OTMyODA4Nw==&mid=2247484769&idx=1&sn=dd3ec294839e59dde4f8984623f2fe7e&chksm=a73c6559904bec4f308ed1b6d5e3655534a02e51b28192a6d7c5449dfcc36008d4b17a2df6de&scene=21#wechat_redirect)  

![](https://mmbiz.qpic.cn/mmbiz_png/buaFLFKicRoCBe90Tg9kTuianFJntZmEr6NTlickYW6GE6ZTSbvUU6XzJO5mhWxw1H5HYB9RJkARUE4dPKKS3j8Jg/640?wx_fmt=png) 
 [https://mp.weixin.qq.com/s/qlxihKyoGBs3jpDuHl5o4Q](https://mp.weixin.qq.com/s/qlxihKyoGBs3jpDuHl5o4Q)
