---
title: nginx 配置location详解 - 简书
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

[![](https://upload.jianshu.io/users/upload_avatars/2755973/434719e6-e5f1-48ac-9d99-18bd1e0a8585.jpeg?imageMogr2/auto-orient/strip|imageView2/1/w/96/h/96/format/webp)
](https://www.jianshu.com/u/763c499f4b6a)

0.9572018.07.25 18:33:20 字数 1,136 阅读 17,670

本文主要介绍下实践过程中常用的几个 nginx 的配置指令及注意的问题  
事后发现，配置不出点 bug 是永远记不住的，都是泪的教训~  
首先是最重要的 location 配置

### 官方文档。

按照惯例首先我们来快速翻译下官方文档  
地址:[http://nginx.org/en/docs/http/ngx_http_core_module.html#location](http://nginx.org/en/docs/http/ngx_http_core_module.html#location)

### 翻译（请对照原文查看）

根据请求 URI 设置配置。

在把 “ `%XX` ” 形式编码之后，会解析相对路径引用，然后再针对 URI 进行`.` “和” `..` 的转化，并且将两个或多个相邻斜线变成单个斜线。

location 可以由前缀字符串或正则表达式定义。  
正则表达式使用 “ `~*` ” 修饰符（用于不区分大小写的匹配）或 “ `~` ” 修饰符（用于区分大小写的匹配）指定。  
为了找到与给定请求匹配的位置，  
1 nginx**_首先检查使用前缀字符串（前缀位置）定义的位置_**。 并且，选择并记住具有最长匹配前缀的位置。  
2 然后按照它们在配置文件中的出现顺序检查正则表达式。 正则表达式的搜索在第一个匹配时终止，并使用相应的配置。  
如果未找到与正则表达式的匹配，则使用先前记住的前缀位置的配置。  
3 如果最长匹配前缀位置具有 “ `^~` ” 修饰符，**_则不检查正则表达式_**。  
4 此外，使用 “ `=` ” 修饰符可以定义 URI 和位置的精确匹配。 如果找到完全匹配，则搜索终止。  
例如，如果频繁发生 “ `/` ” 请求，则定义 “ `location = /` ” 将加速这些请求的处理，因为搜索在第一次比较之后立即终止。

### 对照一个 Demo 来学习

    location  = / {
      # 精确匹配 / ，主机名后面不能带任何字符串
      [ configuration A ]
    }

    location  / {
      # 因为所有的地址都以 / 开头，所以这条规则将匹配到所有请求
      # 但是正则和最长字符串会优先匹配
      [ configuration B ]
    }

    location /documents/ {
      # 匹配任何以 /documents/ 开头的地址，匹配符合以后，记住还要继续往下搜索
      # 只有后面的正则表达式没有匹配到时，这一条才会采用这一条
      [ configuration C ]
    }

    location ~ /documents/Abc {
      # 匹配任何以 /documents/Abc 开头的地址，匹配符合以后，还要继续往下搜索
      # 只有后面的正则表达式没有匹配到时，这一条才会采用这一条
      [ configuration CC ]
    }

    location ^~ /images/ {
      # 匹配任何以 /images/ 开头的地址，匹配符合以后，停止往下搜索正则，采用这一条。
      [ configuration D ]
    }

    location ~* \.(gif|jpg|jpeg)$ {
      # 匹配所有以 gif,jpg或jpeg 结尾的请求
      # 然而，所有请求 /images/ 下的图片会被 config D 处理，因为 ^~ 到达不了这一条正则
      [ configuration E ]
    }

    location /images/ {
      # 字符匹配到 /images/，继续往下，会发现 ^~ 存在
      [ configuration F ]
    }

    location /images/abc {
      # 最长字符匹配到 /images/abc，继续往下，会发现 ^~ 存在
      # F与G的放置顺序是没有关系的
      [ configuration G ]
    }

    location ~ /images/abc/ {
      # 只有去掉 config D 才有效：先最长匹配 config G 开头的地址，继续往下搜索，匹配到这一条正则，采用
        [ configuration H ]
    }

    location ~* /js/.*/\.js 

-   \\= 开头表示精确匹配
-   ^~ 开头表示 uri 以某个常规字符串开头，**这个不是正则表达式**
-   ~ 开头表示区分大小写的正则匹配;
-   ~\* 开头表示不区分大小写的正则匹配
-   / 通用匹配, 如果没有其它匹配, 任何请求都会匹配到

#### 优先级

(location =) > (location 完整路径) > (location ^~ 路径) > (location ,\* 正则顺序) > (location 部分起始路径) > (/)

#### 根据文档说明，以下判断成立

-   / -> config A  
    精确完全匹配
-   /downloads/download.html -> config B  
    匹配 B 以后，往下继续搜索发现没有任何匹配，最后采用 B
-   /images/1.gif -> configuration D  
    首先匹配到 F，往下匹配到 D，停止往下
-   /images/abc/def -> config D  
    最长匹配到 G，往下匹配 D，停止往下  
    你可以看到 任何以 / images / 开头的都会匹配到 D 并停止，FG 写在这里是没有任何意义的，H 是永远轮不到的，这里只是为了说明匹配顺序
-   /documents/document.html -> config C  
    匹配到 C，往下没有任何匹配，采用 C
-   /documents/1.jpg -> configuration E  
    匹配到 C，往下正则匹配到 E
-   /documents/Abc.jpg -> config CC  
    最长匹配到 C，往下正则顺序匹配到 CC，不会往下到 E

### 实际使用建议

    所以实际使用中，个人觉得至少有三个匹配规则定义，如下：
    #直接匹配网站根，通过域名访问网站首页比较频繁，使用这个会加速处理，官网如是说。
    #这里是直接转发给后端应用服务器了，也可以是一个静态首页
    # 第一个必选规则
    location = / {
        proxy_pass http://tomcat:8080/index
    }
    # 第二个必选规则是处理静态文件请求，这是nginx作为http服务器的强项
    # 有两种配置模式，目录匹配或后缀匹配,任选其一或搭配使用
    location ^~ /static/ {
        root /webroot/static/;
    }
    location ~* \.(gif|jpg|jpeg|png|css|js|ico)$ {
        root /webroot/res/;
    }
    #第三个规则就是通用规则，用来转发动态请求到后端应用服务器
    #非静态文件请求就默认是动态请求，自己根据实际把握
    #毕竟目前的一些框架的流行，带.php,.jsp后缀的情况很少了
    location / {
        proxy_pass http://tomcat:8080/
    } 

#### alias 与 root 的区别

这有一篇比较全面的解读  
[https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias](https://stackoverflow.com/questions/10631933/nginx-static-file-serving-confusion-with-root-alias)  
简而言之，root 是把 location 那部分也给拼接起来了。  
比如

     location /static/ {
                    root /var/www/app/static/;
                    autoindex off;
            } 

浏览器中输入 / static  
实际上去找 / var/www/app/static/static 这个路径了。  
所以还是推荐使用 alias 命令。

#### try files 命令

-   官方文档地址 [http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files](http://nginx.org/en/docs/http/ngx_http_core_module.html#try_files)
-   至少有两个参数
-   最后一个参数是重定向参数，是全路径。  
    非常重要，稍微配置不对就容易引起内部死循环或者定位错误，建议最后一个参数使用 404  
    而且最后这个参数是外部的，可以继续去走其他的 location。
-   关于 try files 更多命令可以查看这里[https://www.hi-linux.com/posts/53878.html](https://www.hi-linux.com/posts/53878.html)

#### index 命令

-   官方文档  
    [http://nginx.org/en/docs/http/ngx_http_index_module.html](http://nginx.org/en/docs/http/ngx_http_index_module.html)
-   Defines files that will be used as an index. The file name can contain variables. Files are checked in the specified order. The last element of the list can be a file with an absolute path. Example:

    index index.$geo.html index.0.html /index.html;

更多精彩内容下载简书 APP

"小礼物走一走，来简书关注我"

还没有人赞赏，支持一下

[![](https://upload.jianshu.io/users/upload_avatars/2755973/434719e6-e5f1-48ac-9d99-18bd1e0a8585.jpeg?imageMogr2/auto-orient/strip|imageView2/1/w/100/h/100/format/webp)
](https://www.jianshu.com/u/763c499f4b6a)

总资产 2 (约 0.20 元) 共写了 5.7W 字获得 56 个赞共 20 个粉丝

### 被以下专题收入，发现更多相似内容

### 推荐阅读[更多精彩内容](https://www.jianshu.com/)

-   学习前提 1、了解 python 基础语法 2、了解 re、selenium、BeautifulSoup、os、requ...

    [![](https://upload-images.jianshu.io/upload_images/24596166-30574da02ead246c?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/10f9ec10dbef)
-   grep 只要出现 gene 字眼都查找出 精确查找，一个单词一个单词的搜索 用于找文件前缀 到 file 文件里面查找关...

    [![](https://upload.jianshu.io/users/upload_avatars/25072282/626973e4-3db3-4abc-b21e-813a8a6f35c6.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    呆呱呱](https://www.jianshu.com/u/7d21201e3ea0)阅读 1,758 评论 0 赞 38

    [![](https://upload-images.jianshu.io/upload_images/25072282-1573a79c93f2fb92.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/61ceb910557c)
-   网上有说: 最先加载的是 application.properties，logback.xml 的加载晚于 applic...

    [![](https://upload.jianshu.io/users/upload_avatars/130752/ffbb820a-79b1-42ce-81a2-bdb04c03ae87.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    \_浅墨\_](https://www.jianshu.com/u/9a969b4dae83)阅读 131 评论 0 赞 6
-   • 查看 CPU 信息：lscpu • 查看内存信息：free -h • 查看硬盘信息：df -h 显示当前文件夹的大...

    [![](https://upload.jianshu.io/users/upload_avatars/25072282/626973e4-3db3-4abc-b21e-813a8a6f35c6.jpg?imageMogr2/auto-orient/strip|imageView2/1/w/48/h/48/format/webp)
    呆呱呱](https://www.jianshu.com/u/7d21201e3ea0)阅读 897 评论 0 赞 23

    [![](https://upload-images.jianshu.io/upload_images/25072282-40c807fdd6560281.png?imageMogr2/auto-orient/strip|imageView2/1/w/300/h/240/format/webp)
    ](https://www.jianshu.com/p/08421fcf90bb)
-   2021 年了，终于开始系统性总结 Netty 相关的东西了。这会是 Netty 系列的第一篇，我想先聊聊 “为什么要学习 N... 
    [https://www.jianshu.com/p/a16936455018](https://www.jianshu.com/p/a16936455018) 
    [https://www.jianshu.com/p/a16936455018](https://www.jianshu.com/p/a16936455018)
