# ☕ espresso-logbook · 意式冲煮记录

一个记录**意式浓缩**冲煮参数的响应式 PWA —— 手机 / iPad / 电脑都能访问，可「安装到主屏幕」并离线使用。

温暖咖啡馆设计语言：奶油米色背景、浓缩棕、焦糖点缀；衬线标题 + 干净无衬线 UI + 等宽字体显示数字。

## 功能

- **📍 记录** —— 标志性**拨盘**调参（粉量 / 液重 / 研磨 / 水温，自动算粉液比），顶部弹层切换咖啡豆，内置**萃取计时器**：停止后秒数自动写入「萃取时间」参数。
- **🍶 配方小抄** —— 8 款常见意式饮品（浓缩 / 玛奇朵 / 柯塔朵 / 馥芮白 / 卡布奇诺 / 拿铁 / 摩卡 / 美式），分层玻璃杯剖面图直观呈现配方比例；可自定义配方并实时预览。
- **📜 冲煮日志** —— 每条冲煮卡片显示豆子、粉液比、时间、评分，可展开看全部参数与风味标签。
- **🫘 豆子库** —— 每款豆子的烘焙信息、冲煮次数、平均分与建议研磨；一键设为当前用豆。

数据保存在浏览器 `localStorage`，刷新不丢。

## 技术栈

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)（Workbox 自动生成 Service Worker，预缓存 + 谷歌字体离线缓存）
- 无 UI 框架，纯内联样式还原设计稿

## 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器 (http://localhost:5173)
npm run build      # 生产构建到 dist/
npm run preview    # 本地预览生产构建
npm run icons      # 由 public/*.svg 重新生成 PWA 图标 PNG
```

> 需要 Node 18+。图标由 `public/favicon.svg` / `public/icon-maskable.svg` 经 `sharp` 渲染为 `public/icon-*.png`。

## 部署到 Vercel

仓库推送到 GitHub 后，在 [vercel.com](https://vercel.com) 导入该仓库即可，Vercel 会自动识别为 Vite 项目：

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

无需额外配置，部署后即为可安装的 PWA。

## 连接 GitHub 远程仓库

当前仅做本地 git 管理。新建空仓库后：

```bash
git remote add origin git@github.com:<你的用户名>/espresso-logbook.git
git branch -M main
git push -u origin main
```

或用 GitHub CLI 一步创建并推送：

```bash
gh repo create espresso-logbook --public --source=. --remote=origin --push
```

## 致谢

UI 源自 Claude Design 的 espresso-logbook 设计稿，本仓库将其实现为可部署的 PWA。
