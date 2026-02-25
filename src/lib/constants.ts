// src/lib/constants.ts
export const siteConfig = {
    title: `qfdk's Blog`,
    author: "qfdk",
    description: "黑科技自留地...",
    footer: "© 2026-2027 qfdk | 保留所有权利",

    // 导航菜单
    nav: [
        {href: "/", icon: "Home", label: "首页"},
        {href: "/archive", icon: "Archive", label: "归档"},
        {href: "/about", icon: "User", label: "关于"},
        {href: "/friends", icon: "Link", label: "友链"}
    ],

    // 分类
    categories: [
        {slug: "life", name: "生活随笔"},
        {slug: "tech", name: "技术分享"},
        {slug: "hack", name: "奇技淫巧"},
        {slug: "reading", name: "读书笔记"},
        {slug: "travel", name: "旅行见闻"}
    ],

    // 友情链接
    friends: [
        {name: "Xiaodu博客", url: "https://t.du9l.com/", description: " 鼓捣黑科技的小杜"},
        {
            name: "GitHub",
            url: "https://github.com",
            description: "全球最大的代码托管平台"
        },
        {
            name: "Next.js",
            url: "https://nextjs.org",
            description: "React 框架，用于生产环境的全栈开发"
        }
    ]
};

export const categoryNames: Record<string, string> = Object.fromEntries(siteConfig.categories.map(category => [category.slug, category.name]));
