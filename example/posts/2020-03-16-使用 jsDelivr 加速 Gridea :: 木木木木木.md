---
title: 使用 jsDelivr 加速 Gridea -- 木木木木木
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

如果有博客托管在 GitHub 的话，加载速度着实感人，使用 jsDelivr 的 CDN 大法能有效改善，操作也简单，把原网址替换一下就能搞定！

```js
https://lmm214.github.io/immmmm/media/js/jquery.min.js

```

改为：

```js
https://cdn.jsdelivr.net/gh/lmm214/immmmm/media/js/jquery.min.js

```

其中 `lmm214` 和 `immmmm` 分别为 GitHub 的用户名和仓库名，之后的 `/media/js/jquery.min.js` 为静态文件地址。

### 支持 Gridea 主题自定义

[![](https://lmm.elizen.me/images/2020/03/jsdelivr.png)
](https://lmm.elizen.me/images/2020/03/jsdelivr.png)

`config.json` 添加如下代码：

```js
    {"name": "jsdelivr","label": "jsDelivr 加速","group": "jsDelivr 加速配置","value": "false","type": "select",
      "options": [
        {"label": "开启","value": true},
        {"label": "关闭","value": false}
      ]
    },
    {"name": "username","label": "Github 用户名","group": "jsDelivr 加速配置","value": "","type": "input","note": "请输入 Github 用户名"},
    {"name": "repository","label": "Github 仓库名","group": "jsDelivr 加速配置","value": "","type": "input","note": "请输入 Github 仓库名"}

```

需要处，一般是 `head.ejs` 或 `footer.ejs` 按如下格式调整：

```js
<% if ( site.customConfig.jsdelivr == true) { %>
<script src="https://cdn.jsdelivr.net/gh/<%= site.customConfig.username %>/<%= site.customConfig.repository %>/media/js/jquery.min.js"></script>
<% } else{ %>
<script src="<%= themeConfig.domain %>/media/js/jquery.min.js"></script>
<% }; %>

```

完工！ 
 [https://immmmm.com/jsdelivr-gridea/](https://immmmm.com/jsdelivr-gridea/) 
 [https://immmmm.com/jsdelivr-gridea/](https://immmmm.com/jsdelivr-gridea/)
