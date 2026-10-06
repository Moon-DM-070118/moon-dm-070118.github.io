# 异想纪元·熵寂录 —— 百科站

静态站，无需后端。整站已由「商店/登录」形态重构为**百科**形态。

## 目录结构

```
site/
├── index.html          首页（英雄区 + 栏目入口）
├── collection.html     藏品
├── lore.html           世界观
├── characters.html     角色
├── places.html         地点
├── bestiary.html       造物图鉴
├── combat.html         战斗与属性
├── story.html          剧情
├── style.css           全局样式（百科版）
├── data.js             ★ 所有内容都在这里
├── app.js              引擎：渲染导航/列表/检索/详情弹窗
└── images/             你自己放图（沿用原来的 images 目录）
      home-bg-mobile.jpg / home-bg-tablet.jpg / home-bg-desktop.jpg
      （缺图不影响使用，背景会退化为纯深色）
```

## 怎么加内容（只改 data.js）

每个栏目对应 `ENTRIES` 里的一个数组，往里 push 一条即可：

```js
ENTRIES.collection.push({
  no:     "IS-022-...",     // 编号（卡片右上，可留 "—"）
  name:   "某某",            // 条目名
  sub:    "一句话摘要",       // 卡片上的小字
  series: "人物档案",         // 分类（用于筛选）
  body:   `正文全文
可以多行`,
  spoiler: false             // 可选，true = 深层剧透
});
```

新增栏目：在 `SECTIONS` 里加一条，再建一个同名 html（照抄任意栏目页，只改 `data-page`）。

## 页面如何工作

每个栏目页只有一个空壳 + `data-page="栏目key"`，其余全部由 `app.js` 渲染：

- 自动生成 **导航栏 / 侧边栏 / 页脚**
- 自动生成 **分类筛选（chip）+ 检索框 + 条目卡（带站点「」装饰）**
- 点卡片 → **详情弹窗**（正文按等宽字体排版，保留换行）

## 已剔除

- 商店 / 支付弹窗
- 登录 / 注册 / 个人中心
- 管理员后台 / 工单

（原 `shop.html` `login.html` `profile.html` `admin_*.html` 可弃用。）

## 部署

纯静态，丢到 GitHub Pages / Cloudflare Pages 即可，无需任何后端。

## 待办（内容侧）

- [ ] 藏品：亚薇尔 / 翊华的正文
- [ ] 角色：各角色简介
- [ ] 地点：凛湖、春归村细节
- [ ] 剧情：各章节正文 / 标题
- [ ] 剧透分级：给深层条目补 `spoiler: true`
