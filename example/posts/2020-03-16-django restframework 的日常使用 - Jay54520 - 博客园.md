---
title: django restframework 的日常使用 - Jay54520 - 博客园
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

本文讨论 django restframework 的日常使用，满足常用 api 编写的需求，比如 List, Detail, Update, Put, Patch 等等。探讨 django restframework 的一般使用，争取总结出 django restframework 的最佳实践。

`ModelSerializer` classes don't do anything particularly magical, they are simply a shortcut for creating serializer classes:

-   An automatically determined set of fields.
-   Simple default implementations for the `create()` and `update()` methods.

问题：如何 override ModelSerializer 的 fields？添加属性，read_only 等

## **django restframework 在 List, Retrieve, create, update,  等的实现原理**

**List**

将 QuerySet 序列化为 dict，通过 JsonResponse 返回

```

```

**Create**

从 request 中获取 data: dict，将 data 传入 Serializer，如果序列化后是有效的，就保存，则创建成功；否则，创建失败。

```

```

**retrieve, update or delete**

```

```

**部分修改 （Partial Update）**

对于部分修改，不需要验证所有的东西。

```

```

So the rest framework will not perform field validation check for the fields which is missing in the request data.　　

## **自定义 validation** 

[文档地址](http://www.django-rest-framework.org/api-guide/validators/ "Jay54520")

可以将自定义的放在 Controller 中，进行复用及管理

**针对字段的**

**针对 Class 的**

[**django restframework 相比 Django View 的改进**](http://www.django-rest-framework.org/tutorial/2-requests-and-responses/ "Jay54520")

更加灵活的 request object:

```

```

REST framework also introduces a `Response` object, which is a type of `TemplateResponse` that takes unrendered content and uses content negotiation to determine the correct content type to return to the client.

## 问题：如何决定返回客户端的格式？比如是 json 还是 xml?

通过添加 format suffixes [Adding optional format suffixes to our URLs](http://www.django-rest-framework.org/tutorial/2-requests-and-responses/#adding-optional-format-suffixes-to-our-urls)

[`** 使用 Mixin 进一步精简代码 ** `](http://www.django-rest-framework.org/tutorial/3-class-based-views/#using-mixins "Jay54520")

One of the big wins of using class-based views is that it allows us to easily compose reusable bits of behaviour.

The create/retrieve/update/delete operations that we've been using so far are going to be **pretty similar for any model-backed API views** we create. Those bits of common behaviour are implemented in REST framework's mixin classes.

```

```

## **问：如何控制返回的显示字段。**

比如增加不属于 model 的字段？

1. 如果需要更改很多，那么可以：

重载 serializer 中的 to_representation

具体实现:

```

```

2. 如果只是更改单个，也可以在 serializer 中重载 def get_field。

request 可以在 self 的 context 找到，这样就能根据用户来控制显示信息，比如根据权限

**总结：对于使用框架但是需要自定义的情况，怎么查找自己想要的？**

描述清楚自己的问题

-   熟悉官方文档中的专业名词
-   找到官方文档中的对应章节
-   看源码，弄清源码中各个字段的作用。可以搜索源码中的变量名

## **问：自定义储存的数据**

密码需要 hash 化

是使用 DRF 自带的验证还是在 controller 中写一个 custom_validate？

ManytoMany、外键的修改、增加？

前端传入列表？具体看文档

## **问：增加不属于 serializer 的验证条件**

比如重置密码、修改密码都需要手机验证码。但是用户 model 里面并没有验证码这个选项。

1. 在密码字段增加一个 validator

实现：

使用 DRF 的 [field-level-validation](http://www.django-rest-framework.org/api-guide/serializers/#field-level-validation "Jay54520")。

比如有一个 password 字段，修改前需要验证手机验证码。那么在对应的 Serializer 中添加 validate_password

```

```

优化：你可能在多处需要验证验证码。那么你把上面的验证过程抽象出来，只需要传递验证码以及其他你需要的信息进去。如果验证失败，抛出 serializers.ValidationError 就可以。

2. 单独开出 api 在需要验证码的地方

比如修改邮箱要验证码，那就添加一个对应 api；

修改密码也要验证码，那再添加一个对应 api;

**问：restframework 的表单与 Django 的表单有什么不同？**

**问：重写 field 的逻辑**

设计数据库的时候，喜好通过管道符 | 连接。但是前段传递过来的是一个 list。

怎么修改这个验证？

怎么修改这个保存逻辑？

## **自定义 field**

比如，Django model 中的 Datetime 字段取出来是 python datetime.datetime 类型，但是前端一般需要 timestamp。可以通过重载 \`serializers.ModelSerializer\` 中的 \`serializer_field_mapping\`来解决。

```

```

区分以下几种：

**不可见 fields**

\***\* 只写 fields\*\***

```

```

**不包括 fields**

```

```

**只读 fields**

```

```

特殊情况

对于 modelserializer，数据库中是 required=True，但是在 serializer 中 update 并不需要填入所有的参数，这时需要 required=False

我现在采取 override 的方式　　

```

```

## \***\*[处理嵌套关系](http://www.django-rest-framework.org/api-guide/serializers/#dealing-with-nested-objects "Jay54520")（**渲染外键）\*\*

有一个 field_name=PrimaryKeyRelatedField，我将它变成 field_name=Serializer()，以渲染更多信息。但是创建的时候传入 field=field_id 报错：

> \[  
> "该字段是必填项。"  
> ],

原因：变成嵌套关系后，需要的是一个 instance，而不仅仅是一个 id 了。可以通过 update_request_data 来改变。可以直接改变 request.data，如果只需要用来查找而不需要用来创建以及修改。如果需要创建或修改，则修改对应方法中的 data

```

```

上面的方法还是不行，提示 “字段是必填项”。

进行了搜索，发现都是创建嵌套关系的，不是我想要的。于是换了个思路，不改变 Serializer，只改变 to_representation() 就可以了。

进行嵌套的创建麻烦，并且一般那个嵌套的都有一个 Serializer，那样就并不需要通过嵌套来创建。

**小结：** 同样的需求，有时换一个方式会很好实现。通过查找、比较，找到易实现、易维护的方法。

### 问：\***\*[嵌套关系](http://www.django-rest-framework.org/api-guide/serializers/#dealing-with-nested-objects "Jay54520")的作用是什么？如何通过嵌套关系创建？与不通过嵌套关系创建有什么不一样？有什么好处与缺点？\*\***

## **验证与权限**

是否登陆、实名认证、公司认证、银行卡认证。通过 authentication_classes 组合解决

是否是某个 obj 的 owner，通过 permission_classes 解决

修改密码的问题

如果没有密码怎么处理？

如果有密码怎么处理？

使用 validator 进行验证怎么样？比如验证旧的交易密码。

所以我现在统一做成通过手机验证码找回密码，没有修改密码的接口。

**找回密码接口的实现**

新建一个 api 然后使用表单实现

因为手机验证码这个字段与 serializer 没关系了。

使用 serializer 实现

如果是修改密码，那么验证验证码字段，验证码字段应该是 required=False, 但是在特定情况（如果找回密码）的时候需要。

### **问：authentication_classes 与 permission_classes 的区别**

从现有的使用来看，authentication_classes 与 permission_classes 似乎可以混用。比如实名认证放在 authentication_classes 与 permission_classes 似乎都可以。

从文档中以及字面意思来看：

authentication 用来识别用户的身份

> Authentication is the mechanism of associating an incoming request with a set of identifying credentials, such as the user the request came from, or the token that it was signed with. The [permission](http://www.django-rest-framework.org/api-guide/permissions/) and [throttling](http://www.django-rest-framework.org/api-guide/throttling/) policies can then use those credentials to determine if the request should be permitted.

permission 用来判断用户是否有权限进行某项操作。

所以实名认证、公司认证、银行卡认证应该放在 permission_classes 中比较好，而通过验证码登陆、账号密码登陆、微信等第三方登陆应该放在 authentication_classes 中。

### **问：如何自定义异常的返回信息**

通过自定义 DRF 的 [exception_handler](http://www.django-rest-framework.org/api-guide/settings/#exception_handler "Jay54520")

我的具体实现方法：

```

```

### **总结一下 django restframework 的设计思路。**

1. 设计 serializer

2. 得到 queryset

3. 序列化后返回

或者

1. 设计 serializer

2. 从 request 中获取数据

3. 反序列化后保存

如果你要实现自定义，可以重载相关函数，非常灵活

## **问：使用 rest frame work 实现 filter 功能**

### \[不推荐]自己实现 filter 功能

1. 获取搜索参数

request.query_params

多个 query_params 的问题 [lists from query_params](http://stackoverflow.com/questions/31083467/django-drf-listfield-to-deserialize-list-of-ids-in-gets-queryparams "Jay54520")

传递: key=value1&key=value2

解析: request.query_params.getlist('key')

有时候请求会带上 \[]，编程 key\[]，我采取了修改 request.query_params 的方法

```

```

修改: 修改 request.query_params 就可以。因为 DRF 的源码中也是通过 request.query_params 来 filter

```

```

**如何修改 request.query_params**　　

```

```

2. 根据搜索参数构建 filter

3. 通过 filter 找到 objects

3. 序列化 objects 后返回

self.list() 

### \[推荐]使用 django-filter 实现 filter 功能

#### **问：使用 DRF 以及 django-filter 实现 tag filter 功能**

问：能否使用 DRF 自带或者其扩展来实现搜索功能？

好处是能增强复用性，功能更多，写更少代码。

[使用 django-filter](http://django-filter.readthedocs.io/en/develop/ref/filters.html "Jay54520")

1. 普通 filed

如 price=10, price>10

2. 外键

使用 [modelchoicefilter](http://django-filter.readthedocs.io/en/develop/ref/filters.html#modelchoicefilter "Jay54520")

3. 多对多

```

```

3.2 多选

```

```

**问：OneToManyField 如何实现 ModelMultipleChoiceFilter 的效果**

应该是相同的用法

4. 自定义　　

自定义的 filter 只需要你返回一个 queryset 。

```

```

### **manytomany filter by name(other field) not by id**

通过城市名搜索用户

```

```

name 的含义: 查询 Client model 会变成 client.city\_\_name   

to_field_name 的含义: 对应的 city value 变成 city.name

结果：如 ('city\_\_name', city.name)

源码位置:

```

```

### **问：关于 filter 外键**

**背景：** client 是 user 的一对一

filter(client\_\_user=self.request.user) 与 filter(client=self.request.user.client) 哪个更好？

**问：未登录用户是否会有 client 这个一对一关系？**

没有。

```

```

> [`django.contrib.auth.models.AnonymousUser`](#django.contrib.auth.models.AnonymousUser "django.contrib.auth.models.AnonymousUser") is a class that implements the [`django.contrib.auth.models.User`](#django.contrib.auth.models.User "django.contrib.auth.models.User") interface, with these differences:
>
> -   [id](https://www.cnblogs.com/topics/db/models.html#automatic-primary-key-fields) is always `None`.
> -   [`username`](#django.contrib.auth.models.User.username "django.contrib.auth.models.User.username") is always the empty string.
> -   [`get_username()`](#django.contrib.auth.models.User.get_username "django.contrib.auth.models.User.get_username") always returns the empty string.
> -   [`is_anonymous`](#django.contrib.auth.models.User.is_anonymous "django.contrib.auth.models.User.is_anonymous") is `True` instead of `False`.
> -   [`is_authenticated`](#django.contrib.auth.models.User.is_authenticated "django.contrib.auth.models.User.is_authenticated") is `False` instead of `True`.
> -   [`is_staff`](#django.contrib.auth.models.User.is_staff "django.contrib.auth.models.User.is_staff") and [`is_superuser`](#django.contrib.auth.models.User.is_superuser "django.contrib.auth.models.User.is_superuser") are always `False`.
> -   [`is_active`](#django.contrib.auth.models.User.is_active "django.contrib.auth.models.User.is_active") is always `False`.
> -   [`groups`](#django.contrib.auth.models.User.groups "django.contrib.auth.models.User.groups") and [`user_permissions`](#django.contrib.auth.models.User.user_permissions "django.contrib.auth.models.User.user_permissions") are always empty.
> -   [`set_password()`](#django.contrib.auth.models.User.set_password "django.contrib.auth.models.User.set_password"), [`check_password()`](#django.contrib.auth.models.User.check_password "django.contrib.auth.models.User.check_password"), [`save()`](https://www.cnblogs.com/jay54520/models/instances.html#django.db.models.Model.save "django.db.models.Model.save") and [`delete()`](https://www.cnblogs.com/jay54520/models/instances.html#django.db.models.Model.delete "django.db.models.Model.delete") raise [`NotImplementedError`](https://docs.python.org/3/library/exceptions.html#NotImplementedError "(in Python v3.6)").

> In practice, you probably won’t need to use [`AnonymousUser`](#django.contrib.auth.models.AnonymousUser "django.contrib.auth.models.AnonymousUser") objects on your own, but they’re used by Web requests, as explained in the next section.

 所以 filter(client\_\_user=self.request.user) 与 filter(client=self.request.user.client) 中第一种更好。

## **问：如何寻找自定义 DRF 中 method 的文档、例子？**

**通过文档搜索**

搜索 custom, override, subclass 等

(搜索 django-filter 的文档没找到很明显的说明，搜索它的 git 仓库也没有找到。)

**文档没有，通过搜索引擎搜索**

搜索 django-filter custom filter

找到了这个  [Django-filter and custom querysets](https://kuttler.eu/en/post/django-filter-and-custom-querysets/ "Jay54520")，就能了解了。

**最后根据源码分析**

比如我这里需要自定义 CharFilter 的行为，于是找到 \`django_filters.CharFilter\`，发现它的父类有一个 def filter 函数，返回 queryset。也和文档中的匹配。

我就简单的 override 了一下

```

```

## **令提交数据可改**

DRF 的数据默认不可以修改，要将其变为可修改

```

```

然后就可以直接修改 DRF request 中的数据

**多选字段**

在文档中搜索 multiple，找到了 [multiplechoicefilter](http://django-filter.readthedocs.io/en/develop/ref/filters.html#multiplechoicefilter "Jay54520")

**自定义字段**

自定义一个关键字字段

## **客户端传递列表**

### 传递通过符号连接的字符串

比如，?tag=django|model&other_param=xxx

服务端接收到数据后 split() 一下

**tag 在 model 中的字段类型**

现在是 Charfield，使用 | 连接。

**有没有更好的选择？**

**使用 ManytoMantfield**

如果使用 **ManytoMantfield：** 

**问题：** 

**要把数据写入数据库。** 

**城市那么多，要怎么写？**

**城市还有省份，要怎么做**

 答：首先获取全球城市数据，然后写一个脚本，将数据按照自己的要求写入数据库

**问：使用 ManytoMantfield 的过程**

创建 Model

创建 ManytoMantfield 关系

将数据写入 Model

更新数据

变动 serializer

**前端获取选项**

将 Model 中的所有数据传递出去，以 (id, value) 的形式。

**前端设置 ManytoMantfield 关系**

**前端获取用户所有 tags**

**问：不同权限的用户，看到的序列化后的东西不一样。** 

比如有些字段要一定权限才能看到，没有权限则显示 \`\*\*\*\*\`。

答：重载 serializer 中的 to_representation

**问：如果有一个权限表，那么 restframework 中应该怎么做？**

**其他**

**分页**

自带的分页功能足够满足前端的需要。

```

```

前端通过 next 一直访问下一页，实现翻页。当 next 为空时，前端就能知道是最后一页了。

如果需要适配前端的框架，也可以新建一个 pagination_class，重载下面这个方法

```

```

可以更改返回字段的名称，增加返回的字段，比如状态码　　

**使用 http 协议 built in**

**使用不同的函数**

**post, put, patch 的区别**

POST = 新增

新增，需要所有的数据

login 使用 post，新增一个 session  
GET = 读取

读取单个或者列表  
PUT = 新增或替换

存在则替换，不存在则新增。像 post 一样，需要所有的数据

PATCH = 修改

修改，部分或者全部。  
DELETE = 删除

logout，删除登陆 session

## **问题：\[REST API ]login 与 logout 还是有争议。因为并没有改变用户的实际数据。**

**login**

```

```

这个可以用 post　　

**logout**

感觉这个可以用 delete。

\***\* 问：session 保持登陆的原理 \*\***

\***\* 能从 sessionid 中解析出 user_id\*\***

\***\* 如何管理过期时间的？\*\***

**问：删除后这个 token 是否还以用**

**安全性**

另一个 HTTP Methods 特性是”Safe”，这比较简单，只有 GET 和 HEAD 是 Safe 操作。Safe 特性会影响是否可以快取 (POST/PUT/PATCH/DELETE 一定都不可以快取)。而 Idempotent 特性则是会影响可否 Retry (重试，反正结果一样)。

|        | SAFE? | IDEMPOTENT? |
| ------ | ----- | ----------- |
| GET    | Y     | Y           |
| POST   | N     | N           |
| PATCH  | N     | N           |
| PUT    | N     | Y           |
| DELETE | N     | Y           |

**PUT 与 POST 的区别**

**使用头部**

**期中总结**

项目 demo 快要交付的时候，进行一下总结。

**存在逻辑混乱的部分**

**返回混乱**

没有和前端约定好怎么返回，写到后面存在多种格式的返回。比如表单的选择，有使用 Django form choices 的 tuple 形式，也有直接传递一个 list 的形式。

1. 和前端统一好。不要擅自提前端做主张。

**代码结构混乱** 

**验证混乱**

需要自定义验证条件，代码应该放在哪里？

是使用 DRF 自带的验证还是在 controller 中写一个 custom_validate？

**修改混乱**

有时候需要需该储存的数据，比如密码 hash 化，是否应该在 controller 中写一个 update_validated_data？

**序列化混乱**

大部分使用 serializer，但是有一些特殊的地方，在 Model 中新建了一些序列化方法。还有一些特殊字段的不同显示，写的混乱，东一下、西一下。不好管理、维护。自己写的代码，要增加、更改都会出错。

体会：在之前的代码基础上面修改会更加轻松。但是！如果之前的架构不对，也需要更改架构。所以借鉴之前的代码也需要动脑。

1. 将重复的逻辑进行整合，减少重复，增加可维护性 -- 代码可读性，增加功能需要的代码少并且易理解。

**没有单元测试**

基本下是客户端发现问题，然后跟我说 api 有问题。有时候改动了 model，还影响了之前正常的 api。 
 [https://www.cnblogs.com/jay54520/p/6587480.html](https://www.cnblogs.com/jay54520/p/6587480.html) 
 [https://www.cnblogs.com/jay54520/p/6587480.html](https://www.cnblogs.com/jay54520/p/6587480.html)
