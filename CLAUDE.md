# CLAUDE.md

This file provides guidance when working with code in this repository.

## Project Overview

oh-my-blog 是一个基于 Next.js 的个人博客系统，通过 **vinext** (Vite-based Next.js reimplementation) 部署到 **Cloudflare Workers**。文章和分类数据存储在 Cloudflare KV 中，后台管理界面支持文章的增删改查和动态分类管理。

## Development Commands

```bash
# 安装依赖
pnpm install

# 本地开发
pnpm dev

# 构建
pnpm build

# 上传本地文章到 KV
pnpm run upload-posts

# 部署到 Cloudflare Workers
pnpm run deploy
```

## Architecture

### 运行时

- **vinext**: Vite-based Next.js reimplementation，将 Next.js App Router 运行在 Cloudflare Workers 上
- **Vite 插件**: `vinext()` + `cloudflare()` (在 `vite.config.ts` 中配置)
- **Worker 入口**: `worker/index.ts` — Admin 认证拦截 + 图片优化 + vinext 委托

### 数据存储 (Cloudflare KV)

- 命名空间绑定: `BLOG_POSTS` (在 `wrangler.jsonc` 中配置)
- KV 访问方式: `import { env } from "cloudflare:workers"`
- Key 结构:
  - `posts:index` — 文章元数据 JSON 数组
  - `posts:content:{id}` — 渲染后的 HTML
  - `posts:raw:{id}` — 原始 Markdown
  - `categories:index` — 分类列表 `[{slug, name}]`

### 核心模块

| 文件 | 说明 |
|------|------|
| `src/lib/posts.server.ts` | 前台文章读取 — `fetchPostIndex()` 并行读取文章和分类，注入 `categoryName` |
| `src/lib/admin.server.ts` | 后台 CRUD — 文章增删改查 + 分类管理 |
| `src/lib/markdown-utils.ts` | Markdown 渲染 (markdown-it + shiki，github-light/dark 主题) |
| `src/lib/constants.ts` | 站点配置 (导航、默认分类、友链) |

### 动态分类

- 分类存储在 KV `categories:index`，当 KV 为空时回退到 `siteConfig.categories`
- `fetchPostIndex()` 并行读取文章和分类，为每篇文章注入 `categoryName` 字段
- 后台 `/admin/categories` 可动态增删分类
- 前台侧边栏、分类页、文章详情页均通过 props 接收动态分类数据

### 后台管理 (`/admin`)

- **路由**: `/admin` (文章列表)、`/admin/new` (新建)、`/admin/edit/[id]` (编辑)、`/admin/categories` (分类)
- **API**: `/api/admin/posts` (GET/POST)、`/api/admin/posts/[id]` (GET/PUT/DELETE)、`/api/admin/categories` (GET/PUT)
- **架构**: 服务端页面提供初始数据，客户端组件通过 `useEffect` 从 API 获取最新数据
- **认证**: Worker 层 Basic Auth + Bearer Token（`worker/index.ts` 中的 `checkAdminAuth()`）
  - 凭据通过 Cloudflare Worker Secrets 配置（`ADMIN_USER` + `ADMIN_PASSWORD`）
  - 本地开发使用 `.dev.vars` 文件（构建时自动清理，不会泄露）
  - 安全特性：timing-safe 比较、CSRF Origin 校验、atob 异常处理

### 前台页面

- **首页** (`/`): 文章列表 + 分页
- **文章** (`/posts/[id]`): 文章详情 + Markdown 渲染
- **分类** (`/category/[slug]`): 按分类筛选文章
- **归档** (`/archive`): 按年份归档
- **关于** (`/about`): 关于页面
- **友链** (`/friends`): 友情链接

### UI 组件

- **主题**: next-themes + ThemeToggle，暗黑模式使用内联脚本防止闪烁
- **导航**: `Navigation/` 组件，移动端响应式
- **加载**: NavigationLoading (NProgress 进度条) + ContentLoading (Suspense fallback) + PageReady (内容就绪信号)
- **样式**: Tailwind CSS + CSS Modules (`admin.module.css`, `layout.module.css` 等)

## vinext 注意事项

- vinext 是实验性框架，`loading.tsx` 不能作为真正的 Suspense boundary
- `useSearchParams` 在 vinext 中会导致无限循环 — 避免使用
- `vite.config.ts` 必须包含 `cloudflare()` 插件才能正常部署
- 新增路由文件 (`page.tsx`, `loading.tsx`) 后需要重启 dev server
- 客户端导航不会重新执行服务端组件 — 后台客户端组件需要通过 `useEffect` 从 API 获取最新数据

## File Organization

```
src/
├── app/
│   ├── layout.tsx              # 全局布局
│   ├── page.tsx                # 首页
│   ├── posts/[id]/page.tsx     # 文章详情
│   ├── category/[slug]/page.tsx # 分类页
│   ├── archive/page.tsx        # 归档
│   ├── about/page.tsx          # 关于
│   ├── friends/page.tsx        # 友链
│   ├── admin/                  # 后台管理
│   │   ├── layout.tsx          # 后台布局 (AdminNav)
│   │   ├── admin.module.css    # 后台样式
│   │   └── components/         # 后台客户端组件
│   └── api/admin/              # 后台 API
├── components/                 # 前台可复用组件
└── lib/                        # 核心工具库
```
