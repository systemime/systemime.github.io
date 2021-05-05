---
title: Vue项目 webpack优化 compression-webpack-plugin 开启gzip - osc_omyprm56的个人空间 - OSCHINA - 中文开源技术交流社区
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

摘要：

　　打包的时候开启 gzip 可以很大程度减少包的大小，非常适合于上线部署。更小的体积对于用户体验来说

就意味着更快的加载速度以及更好的用户体验。

       Vue-cli3.0 项目

安装依赖：compression-webpack-plugin

　　npm install compression-webpack-plugin --save-dev

vue.config.js 修改：

```
const CompressionPlugin = require('compression-webpack-plugin');  

```

　const productionGzipExtensions = /\\.(js|css|json|txt|html|ico|svg)(\\?.\*)?$/i;

    module.exports = {
        publicPath: './',
        productionSourceMap: false,
        configureWebpack: {...},
        chainWebpack: config => {
            config.resolve.alias.set('@', resolve('src')); if (process.env.NODE_ENV === 'production') {
                config.plugin('compressionPlugin')
                .use(new CompressionPlugin({
                    filename: '[path].gz[query]',
                    algorithm: 'gzip',
                    test: productionGzipExtensions,
                    threshold: 10240,
                    minRatio: 0.8,
                    deleteOriginalAssets: true }));
            }
        },
    };

CompressionWebpackPlugin 插件参数配置：官网查看（[https://www.webpackjs.com/plugins/compression-webpack-plugin/](https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Fwww.webpackjs.com%2Fplugins%2Fcompression-webpack-plugin%2F)）

注：deleteOriginalAssets: true // 是否删除原资源

### 服务器启用 gzip：

　nginx 配置：

    gzip on;
    gzip_static on;
    gzip_min_length 1k;
    gzip_buffers 4 32k;
    gzip_http_version 1.1;
    gzip_comp_level 2;
    gzip_types text/plain application/x-javascript text/css application/xml;
    gzip_vary on;
    gzip_disable "MSIE [1-6].";

　　gzip 使用环境: http,server,location,if(x), 一般把它定义在 nginx.conf 的 http{…..} 之间

`　　gzip on`

on 为启用，off 为关闭

　　`gzip_min_length 1k`

　　设置允许压缩的页面最小字节数，页面字节数从 header 头中的 Content-Length 中进行获取。默认值是 0，不管页面多大都压缩。建议设置成大于 1k 的字节数，小于 1k 可能会越压越大。

　　`gzip_buffers 4 16k`

　　获取多少内存用于缓存压缩结果，‘4 16k’表示以 16k\*4 为单位获得

`　　gzip_comp_level 5`

　　gzip 压缩比（1~9），越小压缩效果越差，但是越大处理越慢，所以一般取中间值;

`gzip_types text/plain application/x-javascript text/css application/xml text/javascript application/x-httpd-php`

　　对特定的 MIME 类型生效, 其中'text/html’被系统强制启用

`gzip_http_version 1.1`

　　识别 http 协议的版本, 早起浏览器可能不支持 gzip 自解压, 用户会看到乱码

`gzip_vary on`

　　启用应答头 "Vary: Accept-Encoding"

`gzip_proxied off`

　　nginx 做为反向代理时启用, off(关闭所有代理结果的数据的压缩),expired(启用压缩, 如果 header 头中包括 "Expires" 头信息),no-cache(启用压缩, header 头中包含 "Cache-Control:no-cache"),no-store(启用压缩, header 头中包含 "Cache-Control:no-store"),private(启用压缩, header 头中包含 "Cache-Control:private"),no_last_modefied(启用压缩, header 头中不包含 "Last-Modified"),no_etag(启用压缩, 如果 header 头中不包含 "Etag" 头信息),auth(启用压缩, 如果 header 头中包含 "Authorization" 头信息)

`gzip_disable msie6`

IE5.5 和 IE6 SP1 使用 msie6 参数来禁止 gzip 压缩 ) 指定哪些不需要 gzip 压缩的浏览器 (将和 User-Agents 进行匹配), 依赖于 PCRE 库

服务器配置引自 juan26=>[https://segmentfault.com/a/1190000012571492?utm_source=tag-newest](https://www.oschina.net/action/GoToLink?url=https%3A%2F%2Fsegmentfault.com%2Fa%2F1190000012571492%3Futm_source%3Dtag-newest)

　　**注：（gzip_static on）**Nginx 的动态压缩是对每个请求先压缩再输出，这样造成虚拟机浪费了很多 cpu，解决这个问题可以利用 nginx 模块 Gzip Precompression，这个模块的作用是对于需要压缩的文件，直接读取已经压缩好的文件 (文件名为加. gz)，而不是动态压缩，对于不支持 gzip 的请求则读取原文件。 

　　1\. 文件可以使用 gzip 命令来进行压缩，或任何其他兼容的命令。

　　2.gzip_static 配置优先级高于 gzip。

　　3\. 开启 nginx_static 后，对于任何文件都会先查找是否有对应的 gz 文件。

　　4.gzip_types 设置对 gzip_static 无效。

　　5.gzip static 默认适用 HTTP 1.1。

### **查看压缩前后的大小对比：**

```
压缩前：

![](https://oscimg.oschina.net/oscnet/fac2da97e338bb7f3d0f07688ae2413b4e5.png)

压缩后：

![](https://oscimg.oschina.net/oscnet/d1b6bd98f147925f886c13ebfb1f70ead9b.png)



```

 [https://my.oschina.net/u/4283892/blog/3307862](https://my.oschina.net/u/4283892/blog/3307862) 
 [https://my.oschina.net/u/4283892/blog/3307862](https://my.oschina.net/u/4283892/blog/3307862)
