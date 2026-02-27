# oh-my-blog

在寻找个人博客解决方案的过程中，我一直在使用 [firekylin](https://github.com/firekylin/firekylin) 作为博客系统。然而，由于项目长期未更新维护，逐渐出现了一些问题。于是我决定利用空闲时间，基于 Next.js 框架开发了一个简洁的博客系统 - oh-my-blog。

## 技术栈

- **框架**: Next.js (通过 [vinext](https://github.com/cloudflare/vinext) 运行于 Cloudflare Workers)
- **运行时**: Cloudflare Workers
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
│   └── upload-posts.js       # 将本地 Markdown 上传到 KV
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

后台管理 (`/admin`) 和 API (`/api/admin`) 在 **Worker 层** 进行认证拦截，请求到达 vinext 之前就已完成鉴权。

#### 为什么选择 Worker 层 Basic Auth？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **Worker Basic Auth** (当前方案) | 零成本、零依赖、代码可控 | 浏览器原生登录框较简陋 |
| Cloudflare Access | 漂亮的登录页、支持 SSO/OAuth | 免费版限 50 用户、需配置 Zero Trust |

个人博客场景下 Worker Basic Auth 足够使用。如果需要 SSO、多用户管理等高级功能，可迁移到 Cloudflare Access。

#### 设置认证密钥

通过 Cloudflare Worker Secrets 设置（加密存储，不会出现在代码或构建产物中）：

```bash
# 设置后台用户名
echo "your-username" | pnpm wrangler secret put ADMIN_USER

# 设置后台密码
echo "your-password" | pnpm wrangler secret put ADMIN_PASSWORD
```

#### 本地开发

在项目根目录创建 `.dev.vars` 文件：

```
ADMIN_USER=admin
ADMIN_PASSWORD=dev-only-password
```

> `.dev.vars` 已被 `.gitignore` 忽略，构建时会被 vite 插件自动清理，不会泄露到部署产物中。

#### 认证方式

- **浏览器访问 `/admin`**: 自动弹出 Basic Auth 登录对话框
- **API Bearer Token**: `Authorization: Bearer <ADMIN_PASSWORD>`
- **API Basic Auth**: `Authorization: Basic base64(user:password)`

如果不设置 `ADMIN_USER`，默认用户名为 `admin`。

#### 安全特性

- **timing-safe 字符串比较**: 防止时序攻击
- **CSRF Origin 校验**: 写操作 (POST/PUT/DELETE) 验证 Origin 头
- **atob 异常处理**: 防止恶意 Base64 导致 DoS
- **Cache-Control: no-store**: 所有 admin API 响应不缓存

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

认证方式：
- **浏览器访问**: 自动弹出 Basic Auth 登录框
- **API 调用**: 支持 Basic Auth 或 Bearer Token

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
