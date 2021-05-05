---
title: DRF(django-rest-framwork)
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

<a name="b9Lro"></a>
## 视图-序列化数据
```python
from api import models
from rest_framework import serializers
from rest_framework.view import APIView
from rest_framework.generics import GenericAPIView  # get,delete,put,post均有
from rest_framework.generics import ListAPIView, DestoryAPIView, UpdateAPIView, CreateAPIView, RetrieveAPIView
from rest_framework.response import Response
class CourseSerializers(serializers.ModelSerializer):
    """
    序列化查询数据为列表
    一般写法
    """
    class Mate:
        model = models.Course  # 需要序列化的类的名称
        fields = "__all__"
        
    """
    只需要其中某几个字段
    """
    class Mate:
        model = models.Course  # 需要序列化的类的名称
        fields = ['id','name',...]
        
    """
    不需要某个字段
    """
    class Mate:
        model = models.Course  # 需要序列化的类的名称
        exclude = ['字段名']  # 不显示某一字段，写这句话不写fields
        
	"""
    存在表单表关联情况，关联数据默认只显示ID
    """
    cname = serializers.CharField(source='course.title')
    class Mate:
        model = models.Course
        fields = ['id', 'name', 'cname']
        
    """
    存在多对多关系时，关联数据默认只显示ID
    假设多对多字段是tag
    """
    tag_text = serializers.SerializerMethodFeild()  # 也可以时tag_xxx随便写
    class Mate:
        model = models.Course
        fields = ['id', 'name', 'tag_text']
    def get_tag_text(self, obj):
        tag_list = obj.tag.all()
        return [{'id':row.id,'caption':row.name} for row in tag_list]
    	# return [row.name for row in tag_list]
        
    """
    models存在choices情况
    level_choices = (
    	(1,"中级")，
        (2,"高级")
    )
    level = models.IntegerField(verbose_name='级别', choices=level_choices, default=1)
    已获得单条数据库对象xxx，一般获取方法：xxx.get_level_display()
    """
    level_text = serializers.CharFiled(source='get_level_display()')
    class Mate:
        model = models.Course
        fields = ['id', 'name', 'level_text']
    
```
```python
# 方法一（待确认）
class CourseView(GenericAPIView):
    queryset = models.Course.object.all()
    def get(self, request, *args, **kwargs):
        data = self.get_queryset()
        ser = CourseSerializers(instance=data, many=True)  # 单条数据many=false
        return Response("课程列表")

# 方法二
class CourseView(APIView):
    def get(self, request, *args, **kwargs):
        queryset = models.Course.object.all()
        ser = CourseSerializers(instance=queryset, many=True)  # 单条数据many=false
        return Response(ser.data)

# 方法三
class CourseView(ListAPIView, DestoryAPIView, UpdateAPIView, CreateAPIView, RetrieveAPIView):
    """
    LiserAPIView: get方法，获取列表数据
    DestroyAPIView: delete方法
    UpdateAPIView: put和patch方法
    CreateAPIView: create方法
    RetrieveAPIView：获取一条数据
    """
    queryset = models.Course.objects.all()
    serializer_class = CourseSerializers
    
# 方法三
from rest_framework.viewsets import ModelViewSet
class CourseView(ModelViewSet):
    """
    ModelViewSet 包括方法二中比如创建删除等class
    但是url中需要这样写
    ...
    url(r'^user/(?P<pk>\d+)/$', view.CourseView.as_view({'get': 'list', ''})),
    """
    queryset = models.Course.objects.all()
    serializer_class = CourseSerializers
```
<a name="ehIVA"></a>
## View类应用场景
<a name="CWgbL"></a>
### APIView
一般用于非常复杂的非数据库操作<br />![图片.png](https://cdn.nlark.com/yuque/0/2020/png/663138/1588097820132-dad04039-806d-4ffc-bd99-2b6631e5f264.png#align=left&display=inline&height=96&margin=%5Bobject%20Object%5D&name=%E5%9B%BE%E7%89%87.png&originHeight=96&originWidth=483&size=36017&status=done&style=stroke&width=483)
<a name="4s1wM"></a>
### ListAPIView等
```python
from rest_framework.generics import ListAPIView, DestoryAPIView, UpdateAPIView, CreateAPIView, RetrieveAPIView
```
一般用于项目只需要一个或者几个接口时，而不是全部增删改查方法<br />

<a name="jn7Mz"></a>
### ModelViewSet
一般用于实现全部增删改查功能<br />

<a name="SwX8A"></a>
## 面试题
<a name="VQBnQ"></a>
### 你曾经写接口时继承过那些类
至少说出：APIView，ListAPIView，ModelViewset<br />

<a name="s3vIk"></a>
### GenericAPIView作用
```python
# 制定了接口执行流程

如果继承了GenericAPIView的类，他们内部取数据时调用self.get_queryset(),
而它定义在GenericAPIView, 内部返回self.queryset
```
<a name="hiR8O"></a>
## 版本控制
> 如果加入了版本控制，所有的api接口都必须带上版本号   <br />

```python
# 总/分发url.py
from app_name import views
...
urlpatterns = [
	url(r'api/(?P<version>\w+)/test/', view.TestView.as_view())  # url关键字必须是version
]

# views.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response 

class TestView(APIView):
    def get(self, request, *args, **kwargs):
        print(request.version)
        return Response('...')

# settings.py
INSTALLED_APPS = [
	...
    'rest_framework',
]

REST_FRAMEWORK = {
	'DEFAULT_VERSIONING_CLASS': "rest_framework.versioning.URLPathVersioning",
    'ALLOWED_VERSIONS': ['V1', 'V2'],  # 允许的版本
}

# 访问
http://127.0.0.1:8000/api/v1/test/
```

- **不可忽视**<br />
```python
# urls.py
from app_name import views
...
urlpatterns = [
	url(r'api/(?P<version>\w+)/crossdomiam/', view.TestView.as_view())  # url关键字必须是version
]

# view.py
from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response 

class CrossView(APIView):
    def get(self, request):
        return Response('...')
    
# 报错原因
url中携带参数传递，方法中必须接受参数
# 正确写法
def get(self, request, *args, **kwargs):
```
<a name="Z5csr"></a>
## 读取xml文件
```python
class CrossView(APIView):
    def get(self, request, *args, **kwargs):
        with open('crossdomian.xml') as f:
            data = f.read()
        return Response(data)
```
<a name="JKHkp"></a>
## CRUD实现（创建、读取、更新、删除）

- urls.py
```python
from app_name import views

urlpatterns = [
	url(r'api/(?P<version>\w+)/course/new/$',views.CourseNewView.as_view()),
    # 或
    url(r'api/(?P<version>\w+)/course/crud/$',views.CourseCrudView.as_view({'get':'list','post':'create'}))
    url(r'api/(?P<version>\w+)/course/crud/(?P<pk>\d+)/$',views.CourseCrudView.as_view({'get':'retrieve','put':'update','patch':'partial_update','delete':'destroy'}))
    # patch 调用的方法本质也是update，增加了一个属性，其实可以不写
]
```

- view.py
```python
from rest_framework.generics  import CreateAPIView,ListAPIView

class CourseNewView(ListAPIView, CreateAPIView):
# 获取单条数据需要把ListAPIView换成RetrieveAPIView
# 同时增加一条url用于接收需要获取数据id等信息
    queryset = models.Course.object.all()
    serializer_class = CourseSerializer
# 或
from rest_framework.viewset import ModelViewset

class CourseCrudView(ModelViewset):
    queryset = models.Course.object.all()
    serializer_class = CourseSerializer
   
```
<a name="gph2t"></a>
### ModelViewSet URL简写方式

- 一般方法
```python
from django.conf.urls import url
from app_name import views

urlpatterns = [
    url(r'^api/(?P<version>\w+)/course/crud/$',views.CourseCrudView.as_view({'get':'list','post':'create'}))
    url(r'^api/(?P<version>\w+)/course/crud/(?P<pk>\d+)/$',views.CourseCrudView.as_view({'get':'retrieve','put':'update','patch':'partial_update','delete':'destroy'}))
]
```

- 简写
```python
from django.conf.urls import url, include
from rest_framework import routers
from app_name import views

router = routers.DefaultRouter()
router.register(r'前缀名称，如 video_new', views.CourseCrudView)

urlpatterns = [
	url(r'^', include(router.urls)),
    # 也可以加前缀
    # url(r'^api/(?P<version>\w+)/', include(router.urls)),
]
```
<a name="mpN84"></a>
### 多对多请求增加数据
```python
# 数据请求格式
{"id":1, "title":"xxx", "tag":[1,2]}  # tag是多对多对应关系

# 后端
ModelViewSet
```


<a name="fLaGa"></a>
## CRUD实现（从文件中获取）

- urls.py
```python
from app_name import view

urlpatterns = [
	url(r'api/(?P<version>\w+)/course/file/$',views.CourseFileView.as_view({'get':'list','post':'create'}))
    url(r'api/(?P<version>\w+)/course/file/(?P<pk>\d+)/$',views.CourseFileView.as_view({'get':'retrieve','put':'update','patch':'partial_update','delete':'destroy'}))
]
```

- views.py
```python
from rest_framework.viewset import ModelViewset

class CourseFileView(ModelViewset):
    queryset = models.Course.object.all()
    serializer_class = CourseSerializer
    
    # 开始重写list方法
    def list(self, request, *args, **kwargs):
        with open('crossdomian.xml') as f:
            data = f.read()
        return Response(data)
```
