
module.exports = {
  title: "南柯一梦",  // 浏览器标签文字
  description: "希望热情而又企图安逸的综合体.",  // 网页简述
  head: [
    ["link", { rel: "icon", href: "/img/logo.svg" }],  // 浏览器标签头
    ["meta", { name: "viewport", content: "width=device-width,initial-scale=1,user-scalable=no" }]
  ],
  theme: "gungnir",
  locales: {
    "/": {
      lang: "en-US"
    },
    "/zh/": {
      lang: "zh-CN"
    }
  },
  themeConfig: {
    // 假定是 GitHub. 同时也可以是一个完整的 GitLab URL
    repo: "systemime/systemime.github.io",
    // 自定义仓库链接文字。默认从 `themeConfig.repo` 中自动推断为
    // "GitHub"/"GitLab"/"Bitbucket" 其中之一，或是 "Source"。
    repoLabel: '查看源码',
    // 假如文档不是放在仓库的根目录下：
    docsDir: "example",
  
    editLinks: false,  // 每个页面下去 github修改字样 默认是 false, 设置为 true 来启用
    editLinkText: '帮助我们改善此页面！',  // 默认为 "Edit this page"  // 该主题无效

    lastUpdated: true,  // 最后更新时间 https://v1.vuepress.vuejs.org/zh/theme/default-theme-config.html#%E6%9C%80%E5%90%8E%E6%9B%B4%E6%96%B0%E6%97%B6%E9%97%B4
    hitokoto: true, // enable hitokoto (一言) or not?

    search: true,  // 可选：是否启用搜索，默认：true
    searchMaxSuggestions: 10,  // 可选：搜索的最大结果数，默认：10
    searchPlaceholder: "$ grep ...",  // 可选：搜索栏占位文本，默认："$ grep ..."
    searchIcon: "ri-search-2-line",  // 搜索图标

    languageIcon: "hi-translate",  // 语言选项图标
    rss: {
      site_url: "https://qfdxz.top",
      copyright: "ListenWind 2018-2021",
      count: 20
    },
    comment: {
      platform: "github",
      owner: "systemime",
      repo: "OnTheRoad",
      clientId: "44945ce0f6f01f549126",
      clientSecret: "d9e6f110be2dbe6404b0274e0bd0b164eb283107"
    },
    analytics: {
      // ga: "UA-146858305-4",
      ga: "G-PWL6F9GCG1",
      // ba: "0958eaa31f4f4656f36bd33673332939"
      ba: "c3e3e0cdb298aa92c4a79a6fbbc8a263"
    },
    katex: true,
    mermaid: true,  // 流程图、时序图、甘特图等渲染
    chartjs: true,  // 图表渲染
    roughviz: true,  // 手绘图渲染
    markmap: true,  // 思维导图渲染
    mdPlus: {
      all: true
    },
    locales: {
      "/": {
        label: "English",
        selectText: "Languages",
        nav: require("./configs/nav/en"),
        sidebar: require("./configs/sidebar/en")
      },
      "/zh/": {
        label: "简体中文",
        selectText: "选择语言",
        nav: require("./configs/nav/zh"),
        sidebar: require("./configs/sidebar/zh")
      }
    },
    personalInfo: {
      name: "拔丝土豆",
      avatar: "/img/avatar.jpeg",
      description: "一个情绪稳定的成年人",
      sns: {
        github: "systemime",
        // linkedin: "xiaohan-zou-55bba0160",  // 领英
        // facebook: "renovamen.zou",  // facebook
        // twitter: "renovamen_zxh",  // Twitter
        zhihu: "shi-wan-wan-50",
        email: "systemime@gmail.com",
        customize: [  // 添加其他的社交平台
          {
            icon: "fa-reddit-alien",  // 社交平台的图标
            link: "https://www.reddit.com/user/systemime"  // 主页链接
          },
          {
            icon: "ri-netease-cloud-music-line",
            link: "https://music.163.com/#/my/m/music/playlist?id=550411417"
          }
          // ...
        ]
      }
    },
    homeHeaderImages: [
      {
        path: "/img/home-bg/1.jpg",
        mask: "rgba(40, 57, 101, .4)"
      },
      {
        path: "/img/home-bg/2.jpg",
        mask: "rgb(251, 170, 152, .2)"
      },
      {
        path: "/img/home-bg/3.jpg",
        mask: "rgba(68, 74, 83, .1)"
      },
      {
        path: "/img/home-bg/4.jpg",
        mask: "rgba(19, 75, 50, .2)"
      }
    ],
    pages: {
      tags: {
        subtitle: "Black Sheep Wall",
        bgImage: {
          path: "/img/pages/tags.jpg",
          mask: "rgba(211, 136, 37, .5)"
        }
      },
      links: {
        subtitle:
          "When you are looking at the stars, please put the brightest star shining night sky as my soul.",
        bgImage: {
          path: "/img/pages/links.jpg",
          mask: "rgba(64, 118, 190, 0.5)"
        }
      }
    },
    footer: `
      &copy; <a href="https://github.com/Renovamen" target="_blank">Renovamen</a> 2018-2021
      <br>
      Powered by <a href="https://vuepress.vuejs.org" target="_blank">VuePress</a> &
      <a href="https://github.com/Renovamen/vuepress-theme-gungnir" target="_blank">Gungnir</a>
    `
  },
  markdown: {
    // lineNumbers: true,
    extractHeaders: ["h2", "h3", "h4", "h5"]
  }
};
