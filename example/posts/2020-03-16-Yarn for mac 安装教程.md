---
title: Yarn for mac 安装教程
subtitle: 文章暂存
author: systemime
date: 2020-03-16
header_img:  /img/in-post/2020-10-29/header.jpg
catalog: true
tags:
  - python
---

欢迎来到我的世界.

<!-- more -->

    Yarn是Facebook最近发布的一款依赖包安装工具。

##### 快速安装

- **MacOS 直接使用脚本**
```
curl -o- -L https://yarnpkg.com/install.sh | bash  
```

- **Homebrew 方式**
```
brew install yarn 
```

- **npm 方式**
```
npm install -g yarn  
```

- **查看是否安装成功**
```
yarn --version 
```

- **异常情况处理:**
```
yarn --version
```

##### 解决方式:

需要在环境变量中配置 yarn，需要在终端执行下面两个步骤命令:
```
    1. touch ~/.bash_profile   //touch的意思是没有就创建；.bash_profile这是系统临时的环境变量， 
       
    2. sudo open -e ~/.bash_profile
```

如果从来没有改过 `.bash_profile`文件，可以会提示被锁定，这时需要将这个文件的内容复制到另一份 txt 文件，做二次保存，之后删除`.bash_profile`:
```
    rm -rf ~/.bash_profile
```

重新执行第 1，第 2 步骤，就可以修改`.bash_profile`文件了

为了在全局访问 Yarn 的可执行文件，需要在`.bash_profile`配置`PATH`变量，如下:
```
    export PATH = "$PATH:`yarn global bin`"

    具体实现方式：

    export PATH="$PATH:`/Users/allenlas/node_global/bin/yarn`"
```

之后运行:
```
    3. source ~/.bash_profile

    4. yarn --vesion 
```

运行日志如下:
```
    ➜  ~ npm install yarn -g 
    /usr/local/bin/yarnpkg -> /usr/local/lib/node_modules/yarn/bin/yarn.js
    /usr/local/bin/yarn -> /usr/local/lib/node_modules/yarn/bin/yarn.js
    + yarn@1.17.3
    added 1 package in 3.524s
    ➜  ~ yarn -version
    1.17.3 
```

##### 和 Npm 命令备录

区别命令

| Npm                        | Yarn                       | 功能描述                   |
| -------------------------- | -------------------------- | ---------------------- |
| npm install(npm i)         | yarn install(yarn)         | 根据 package.json 安装所有依赖 |
| npm i –save \[package]     | yarn add \[package]        | 添加依赖包                  |
| npm i –save-dev \[package] | yarn add \[package] –dev   | 添加依赖包至 devDependencies |
| npm i -g \[package]        | yarn global add \[package] | 进行全局安装依赖包              |
| npm update –save           | yarn upgrade \[package]    | 升级依赖包                  |
| npm uninstall \[package]   | yarn remove \[package]     | 移除依赖包                  |

相同操作的命令

| Npm                          | Yarn                          | 功能描述                       |
| ---------------------------- | ----------------------------- | -------------------------- |
| npm run                      | yarn run                      | 运行 package.json 中预定义的脚本    |
| npm config list              | yarn config list              | 查看配置信息                     |
| npm config set registry 仓库地址 | yarn config set registry 仓库地址 | 更换仓库地址                     |
| npm init                     | yarn init                     | 互动式创建 / 更新 package.json 文件 |
| npm list                     | yarn list                     | 查看当前目录下已安装的 node 包         |
| npm login                    | yarn login                    | 保存你的用户名、邮箱                 |
| npm logout                   | yarn logout                   | 删除你的用户名、邮箱                 |
| npm outdated                 | yarn outdated                 | 检查过时的依赖包                   |
| npm link                     | yarn link                     | 开发时链接依赖包，以便在其他项目中使用        |
| npm unlink                   | yarn unlink                   | 取消链接依赖包                    |
| npm publish                  | yarn publish                  | 将包发布到 npm                  |
| npm test                     | yarn test                     | 测试 = yarn run test         |
| npm bin                      | yarn bin                      | 显示 bin 文件所在的安装目录           |
| npm info                     | yarn info                     | 显示一个包的信息                   |

[](https://juejin.cn/user/1838039172387885)



打开新标签页发现好内容，掘金、GitHub、Dribbble、ProductHunt 等站点内容轻松获取。快来安装掘金浏览器插件获取高质量内容吧！ 

原文链接：[https://juejin.cn/post/6844903953675583496](https://juejin.cn/post/6844903953675583496) 
