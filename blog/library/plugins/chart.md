---
title: plugin-chart
date: 2020-03-26
---

<p>
  <a href="https://www.npmjs.com/package/vuepress-plugin-chart" target="_blank">
    <img src="https://img.shields.io/npm/v/vuepress-plugin-chart.svg?style=flat-square&logo=npm" style="display: inline; margin: 0" alt="npm">
  </a>
  <a href="https://github.com/Renovamen/vuepress-theme-gungnir/tree/main/packages/plugins/chart" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-vuepress--plugin--chart-26A2FF?style=flat-square&logo=github" style="display: inline; margin: 0" alt="github">
  </a>
  <a href="https://github.com/Renovamen/vuepress-theme-gungnir/blob/main/packages/plugins/chart/LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" style="display: inline; margin: 0" alt="license">
  </a>
</p>

Plugin `vuepress-plugin-chart` for adding JavaScript charting library [Chart.js](https://www.chartjs.org) to [VuePress](https://vuepress.vuejs.org/) to create interactive charts in Markdown.


## Install

```bash
yarn add vuepress-plugin-chart
# or
npm install vuepress-plugin-chart
```

Then add it to your `.vuepress/config.js`:

```js
module.exports = {
  plugins: [
    [
      'vuepress-plugin-chart'
    ]
  ]
}
```


## Usage

The token info of the code block should be `chart`, for example:

```chart
{
  "type": "doughnut",
  "data": {
    "datasets": [{
      "data": [10, 20, 30],
      "backgroundColor": [
        "rgba(255, 99, 132)",
        "rgba(255, 206, 86)",
        "rgba(54, 162, 235)"
      ]
    }],
    "labels": ["Red", "Yellow", "Blue"]
  }
}
```

::: details Code
~~~json
```chart
{
  "type": "doughnut",
  "data": {
    "datasets": [{
      "data": [10, 20, 30],
      "backgroundColor": [
        "rgba(255, 99, 132)",
        "rgba(255, 206, 86)",
        "rgba(54, 162, 235)"
      ]
    }],
    "labels": ["Red", "Yellow", "Blue"]
  }
}
```
~~~
:::

::: danger
The **key** should be in quotes, or some unexpected errors will occured.
:::

Refer to the [documentation of Chart.js](https://www.chartjs.org/docs/latest/) for more information.


## License

[MIT](https://github.com/Renovamen/vuepress-theme-gungnir/blob/main/packages/plugins/chart/LICENSE)
