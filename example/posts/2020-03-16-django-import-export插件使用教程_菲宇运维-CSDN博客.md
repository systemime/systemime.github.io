---
title: django-import-export插件使用教程_菲宇运维-CSDN博客
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

顾名思义，这是一个用于处理导入和导出数据的库。django-import-export 库支持多种格式，包括 xls、csv、json、yaml 以及 tablib 支持的所有其他格式。它还有一个 Django 管理集成，使用起来非常方便。

* * *

### 安装插件

使用 PIP 安装

pip install django-import-export

更新**settings.py**:

INSTALLED_APPS = (
    ...
    'import_export',
)

还有一个可选的配置，我通常这样添加:

IMPORT_EXPORT_USE_TRANSACTIONS = True

默认值为 False。它确定库是否会在数据导入中使用数据库事务，以确保安全。

* * *

Resources

django-import-export 库使用 Resource 的概念，它的类定义非常类似于 Django 处理模型表单和管理类的方式。

在文档中，作者建议将与资源相关的代码放在 admin.py 文件。但是，如果实现与 Django admin 没有关系，我通常更喜欢在 app 文件夹里创建一个名为 resources.py。

**models.py**

from django.db import models
class Person(models.Model):
    name = models.CharField(max_length=30)
    email = models.EmailField(blank=True)
    birth_date = models.DateField()
    location = models.CharField(max_length=100, blank=True)

**resources.py**

from import_export import resources
from .models import Person
class PersonResource(resources.ModelResource):
    class Meta:
        model = Person

这是最简单的定义。您可以将几个配置传递给元类，如：`fields`, `exclude`

* * *

导出数据

导出数据到 CSV

from .resources import PersonResource
person_resource = PersonResource()
dataset = person_resource.export()
dataset.csv

id,name,email,birth_date,location
1,John,john@doe.com,2016-08-11,Helsinki
2,Peter,peter@example.com,2016-08-11,Helsinki
3,Maria,maria@gmail.com,2016-08-11,Barcelona
4,Vitor,vitor@freitas.com,2016-08-11,Oulu
5,Erica,erica@gmail.com,2016-08-11,Oulu

导出数据到 JSON

dataset.json

\[
  {"id": 1, "name": "John", "email": "john@doe.com", "birth_date":"2016-08-11","location":"Helsinki"},
  {"id": 2, "name": "Peter", "email": "peter@example.com", "birth_date":"2016-08-11","location":"Helsinki"},
  {"id": 3, "name": "Maria", "email": "maria@gmail.com", "birth_date":"2016-08-11","location":"Barcelona"},
  {"id": 4, "name": "Vitor", "email": "vitor@freitas.com", "birth_date":"2016-08-11","location":"Oulu"},
  {"id": 5, "name": "Erica", "email": "erica@gmail.com", "birth_date":"2016-08-11","location":"Oulu"}
]

导出数据到 YAML

dataset.yaml

\- {birth_date: '2016-08-11', email: john@doe.com, id: 1, location: Helsinki, name: John}
\- {birth_date: '2016-08-11', email: peter@example.com, id: 2, location: Helsinki, name: Peter}
\- {birth_date: '2016-08-11', email: maria@gmail.com, id: 3, location: Barcelona, name: Maria}
\- {birth_date: '2016-08-11', email: vitor@freitas.com, id: 4, location: Oulu, name: Vitor}
\- {birth_date: '2016-08-11', email: erica@gmail.com, id: 5, location: Oulu, name: Erica}

过滤数据

from .resources import PersonResource
from .models import Person
person_resource = PersonResource()
queryset = Person.objects.filter(location='Helsinki')
dataset = person_resource.export(queryset)
dataset.yaml

\- {birth_date: '2016-08-11', email: john@doe.com, id: 1, location: Helsinki, name: John}
\- {birth_date: '2016-08-11', email: peter@example.com, id: 2, location: Helsinki, name: Peter}

视图的例子

导出到 CSV 视图

from django.http import HttpResponse
from .resources import PersonResource
def export(request):
    person_resource = PersonResource()
    dataset = person_resource.export()
    response = HttpResponse(dataset.csv, content_type='text/csv')
    response\['Content-Disposition'] = 'attachment; filename="persons.csv"'
    return response

导出到 Excel 视图

from django.http import HttpResponse
from .resources import PersonResource
def export(request):
    person_resource = PersonResource()
    dataset = person_resource.export()
    response = HttpResponse(dataset.xls, content_type='application/vnd.ms-excel')
    response\['Content-Disposition'] = 'attachment; filename="persons.xls"'
    return response

* * *

导入数据

查看**new_persons.csv**的数据：

name,email,birth_date,location,id
Jessica,jessica@jones.com,2016-08-11,New York,
Mikko,mikko@suomi.com,2016-08-11,Jyväskyla,

id 必须存在，因为它是主键。但是它会生成，所以我们不需要指定值。

**import.html**

{% extends 'base.html' %}
{% block content %}
  <form method="post" enctype="multipart/form-data">
    {% csrf_token %}
    <input type="file" name="myfile">
    <button type="submit">Upload</button>
  </form>
{% endblock %}

**views.py**

from tablib import Dataset
def simple_upload(request):
    if request.method == 'POST':
        person_resource = PersonResource()
        dataset = Dataset()
        new_persons = request.FILES\['myfile']
        imported_data = dataset.load(new_persons.read())
        result = person_resource.import_data(dataset, dry_run=True)  # Test the data import
        if not result.has_errors():
            person_resource.import_data(dataset, dry_run=False)  # Actually import now
    return render(request, 'core/simple_upload.html')

* * *

### Django 后台管理

在 admin.py 里使用`ImportExportModelAdmin`，而不是`ModelAdmin`

from import_export.admin import ImportExportModelAdmin
from django.contrib import admin
from .models import Person
@admin.register(Person)
class PersonAdmin(ImportExportModelAdmin):
    pass

添加之后刷新页面你就会看到导入和导出按钮。

![](https://www.django.cn/media/upimg/1_20180711224528_701.jpg)

在导入现有项目时，导入功能具有良好的差异性：

![](https://www.django.cn/media/upimg/2_20180711224739_950.jpg)

这是一个大的 Django 库。你可以用它做更多的事情。它的文档完全值得一看：[API reference](https://django-import-export.readthedocs.io/en/latest/getting_started.html#creating-import-export-resource). 
 [https://blog.csdn.net/bbwangj/article/details/89486433](https://blog.csdn.net/bbwangj/article/details/89486433) 
 [https://blog.csdn.net/bbwangj/article/details/89486433](https://blog.csdn.net/bbwangj/article/details/89486433)
