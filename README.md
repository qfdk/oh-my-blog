# oh-my-blog

一个基于 [vinext](https://github.com/cloudflare/vinext) 的个人博客系统，运行在 Cloudflare Workers 上。vinext 是 Cloudflare 开发的 Vite-based Next.js 实现，让 Next.js App Router 应用能够原生运行在 Workers 边缘网络。

## 技术栈

- **框架**: [vinext](https://github.com/cloudflare/vinext) `0.0.32` — Vite-based Next.js on Cloudflare Workers
- **运行时**: Cloudflare Workers (边缘计算)
- **存储**: Cloudflare KV
- **图片优化**: Cloudflare Images
- **构建工具**: Vite
- **Markdown 渲染**: markdown-it + shiki (代码高亮)
- **样式**: Tailwind CSS + CSS Modules
- **包管理**: pnpm

## 项目结构

```
.
├── posts/                    # 本地博客文章 (用于上传到 KV)
├── scripts/
│   └── upload-posts.mjs      # 将本地 Markdown 上传到 KV
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 全局布局 (导航、侧边栏、页脚)
│   │   ├── page.tsx          # 首页 (文章列表 + 分页)
│   │   ├── posts/[id]/       # 文章详情页
│   │   ├── category/[slug]/  # 分类页
│   │   ├── archive/          # 归档页
│   │   ├── about/            # 关于页
│   │   ├── friends/          # 友链页
│   │   ├── admin/            # 后台管理
│   │   │   ├── page.tsx      # 文章列表管理
│   │   │   ├── new/          # 新建文章
│   │   │   ├── edit/[id]/    # 编辑文章
│   │   │   └── categories/   # 分类管理
│   │   └── api/admin/        # 后台 API 接口
│   ├── components/           # 可复用组件
│   └── lib/                  # 核心工具库
│       ├── posts.server.ts   # 文章读取 (KV)
│       ├── admin.server.ts   # 后台 CRUD (KV)
│       ├── markdown-utils.ts # Markdown 渲染
│       └── constants.ts      # 站点配置
├── worker/
│   └── index.ts              # Worker 入口 (图片优化 + vinext)
├── vite.config.ts            # Vite + vinext + Cloudflare 插件
└── wrangler.jsonc            # Worker 配置 (KV, Assets, Images)
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地开发

```bash
pnpm dev
```

开发服务器运行在 `http://localhost:3001`。

### 3. 上传文章到 KV

将 `/posts` 目录下的 Markdown 文件上传到 Cloudflare KV：

```bash
pnpm run upload-posts
```

### 4. 配置后台认证

后台管理 (`/admin`) 通过 **Cloudflare Access** (Zero Trust) 保护，认证方式为邮箱 One-Time PIN。详见 [Cloudflare Zero Trust 文档](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/self-hosted-apps/)。

### 5. 部署到 Cloudflare Workers

```bash
pnpm run deploy
```

## KV 数据结构

| Key | 内容 |
|-----|------|
| `posts:index` | 文章元数据数组 `[{id, title, date, category, excerpt}]` |
| `posts:content:{id}` | 渲染后的 HTML |
| `posts:raw:{id}` | 原始 Markdown |
| `categories:index` | 分类列表 `[{slug, name}]` |

## 后台管理

访问 `/admin` 进入后台管理界面（浏览器会弹出登录对话框），支持：

- 文章的增删改查 (Markdown 编辑器 + 实时预览)
- 动态分类管理 (添加/删除分类)
- 表单验证 + Toast 通知

## 功能特性

- [x] 暗黑主题模式
- [x] 响应式设计 (移动端适配)
- [x] 代码语法高亮 (github-light/dark 主题)
- [x] 分页浏览
- [x] 文章归档
- [x] 动态分类管理
- [x] 后台文章编辑器
- [x] 图片优化 (Cloudflare Images)
- [x] NProgress 路由加载进度条
- [ ] 加密某些指定文章
