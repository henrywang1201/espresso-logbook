# ☕ espresso-logbook · 意式冲煮记录

一个记录**意式浓缩**冲煮参数的响应式 PWA —— 手机 / iPad / 电脑都能访问，可「安装到主屏幕」并离线使用。

温暖咖啡馆设计语言：奶油米色背景、浓缩棕、焦糖点缀；衬线标题 + 干净无衬线 UI + 等宽字体显示数字。

## 功能

- **📍 记录** —— 标志性**拨盘**调参（粉量 / 液重 / 研磨 / 水温，自动算粉液比），顶部弹层切换咖啡豆，内置**萃取计时器**（停止后秒数自动写入「萃取时间」），并在下方**风味评分**（1–10）后保存。
- **🍶 配方小抄** —— 8 款常见意式饮品（浓缩 / 玛奇朵 / 柯塔朵 / 馥芮白 / 卡布奇诺 / 拿铁 / 摩卡 / 美式），分层玻璃杯剖面图直观呈现配方比例；可自定义配方、删除配方并实时预览。
- **📜 冲煮日志** —— 每条冲煮卡片显示豆子、粉液比、时间、评分，可展开看全部参数与风味标签，可删除记录。
- **🫘 豆子库** —— 每款豆子的烘焙信息、冲煮次数、平均分与建议研磨；可**添加 / 编辑 / 删除**豆子，一键设为当前用豆。

**数据存于 Supabase（云端 Postgres），所有访问者共享同一份、永久保存、可自由增删改，且改动实时同步到所有人。** 未配置后端时回退为本地只读演示数据。

## 技术栈

- [Vite 5](https://vitejs.dev/) + [React 18](https://react.dev/)
- [Supabase](https://supabase.com/)（托管 Postgres + 自动 REST API + Realtime，作为共享后端）
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)（Workbox 自动生成 Service Worker，预缓存 + 谷歌字体离线缓存）
- 无 UI 框架，纯内联样式还原设计稿

## 后端设置（Supabase）

数据由 Supabase 托管，需一次性配置（免费）：

1. 在 [supabase.com](https://supabase.com) 新建项目。
2. 打开项目的 **SQL Editor**，整段运行仓库里的 [`supabase/schema.sql`](supabase/schema.sql) —— 它会创建
   `beans` / `brews` / `drinks` 三张表、开放读写策略、开启实时，并灌入初始种子数据。
3. 在 **Project Settings → API** 复制 `Project URL` 与 `anon public` key。
4. 本地复制 `.env.example` 为 `.env.local` 并填入：

   ```bash
   VITE_SUPABASE_URL=https://你的项目.supabase.co
   VITE_SUPABASE_ANON_KEY=你的 anon public key
   ```

> **安全说明**：当前为「完全开放」—— anon key 随前端公开、RLS 策略允许任何人增删改查。任何拿到站点的人都能修改/清空全部数据。
> 这是当前选择的取舍；如需收紧，可改为「写操作需口令」或加 RLS 限制（改动局部、可平滑升级）。

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

另外需在 **Project Settings → Environment Variables** 配置与 `.env.local` 同名的两个变量
（`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`，因 `VITE_` 前缀在构建期注入），然后重新部署。
部署后即为可安装、数据云端共享的 PWA。

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
