---
title: plugin-md-plus
date: 2020-03-26
---

<p>
  <a href="https://www.npmjs.com/package/@renovamen/vuepress-plugin-md-plus" target="_blank">
    <img src="https://img.shields.io/npm/v/@renovamen/vuepress-plugin-md-plus.svg?style=flat-square&logo=npm" style="display: inline; margin: 0" alt="npm">
  </a>
  <a href="https://github.com/Renovamen/vuepress-theme-gungnir/tree/main/packages/plugins/md-plus" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-@renovamen/vuepress--plugin--md--plus-26A2FF?style=flat-square&logo=github" style="display: inline; margin: 0" alt="github">
  </a>
  <a href="https://github.com/Renovamen/vuepress-theme-gungnir/blob/main/packages/plugins/md-plus/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" style="display: inline; margin: 0" alt="license">
  </a>
</p>

`@renovamen/vuepress-plugin-md-plus` 插件，可以为 Markdown 中加入更多语法和功能。目前支持：

- 脚注（基于 [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)）
- 高亮标记（基于 [markdown-it-footnote](https://github.com/markdown-it/markdown-it-footnote)）


## 安装

```bash
yarn add @renovamen/vuepress-plugin-md-plus
# or
npm install @renovamen/vuepress-plugin-md-plus
```


## 配置

你可以在 `.vuepress/config.js` 中一键启用所有功能：

```js
themeConfig: {
  mdPlus: {
    all: true, // 全部启用
  }
}
```

也可以分别启用：

```js
themeConfig: {
  mdPlus: {
    footnote: true,  // 脚注
    mark: true  // 高亮标记
  }
}
```


## 使用

### 脚注

给文字加上脚注[^1]

::: details 语法
```
给文字加上脚注[^1]

[^1]: 脚注内容
```
:::

### 高亮标记

高亮标记重要的内容：衬衫的价格是 ==九磅十五便士==

::: details 语法
```
衬衫的价格是 ==九磅十五便士==
```
:::

---

[^1]: 脚注内容
