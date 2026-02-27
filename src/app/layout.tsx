// src/app/layout.tsx
import {Suspense} from "react";
import "@/styles/globals.css";
// 显式导入客户端组件的 CSS，确保 SSR 时不丢失样式
import "@/components/Navigation/navigation.module.css";
import "@/components/ThemeToggle/style.module.css";
import "@/components/ArticleCard.module.css";
import {siteConfig} from "@/lib/constants";
import Navigation from "@/components/Navigation";
import {getCategoryStats} from "@/lib/posts.server";
import {Metadata} from "next";
import {Providers} from "@/components/Providers";
import {ThemeToggle} from "@/components/ThemeToggle";
import CategorySidebar from "@/components/CategorySidebar";
import NavigationLoading from "@/components/NavigationLoading";
import ContentLoading from "@/components/ContentLoading";

import styles from "./layout.module.css";

// 移除Google字体，直接使用系统字体栈

export const metadata: Metadata = {
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.title}`
    },
    description: siteConfig.description,
    metadataBase: new URL('https://blog.qfdk.me'),
    icons: {
        icon: '/favicon.ico',
    },
    // 添加其他元数据提高性能
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no',
    }
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ]
};

// 分离侧边栏获取数据的逻辑，使用React.cache优化数据获取
const SidebarWrapper = async () => {
    const categoryStats = await getCategoryStats();
    // 使用key属性帮助React识别这个组件实例，避免不必要的重新渲染
    return <CategorySidebar key="sidebar" categoryStats={categoryStats}/>;
};

const SidebarSkeleton = () => {
    const categoryItems = [1, 2, 3, 4, 5];
    const friendItems = [1, 2, 3];
    const widths = [
        styles.sidebarSkeletonItemWide,
        styles.sidebarSkeletonItemMedium,
        styles.sidebarSkeletonItemShort,
        styles.sidebarSkeletonItemMedium,
        styles.sidebarSkeletonItemWide
    ];
    return (
        <>
            <div className="widget">
                <h3>分类</h3>
                <div className={styles.sidebarSkeleton}>
                    <ul className={styles.sidebarSkeletonList}>
                        {categoryItems.map((item, index) => (
                            <li
                                key={item}
                                className={`${styles.skeletonLine} ${styles.sidebarSkeletonItem} ${widths[index]} ${styles.skeletonLineAnimated}`}
                                aria-hidden="true"
                            ></li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="widget">
                <h3>友情链接</h3>
                <div className={styles.sidebarSkeleton}>
                    <ul className={styles.sidebarSkeletonList}>
                        {friendItems.map((item, index) => (
                            <li
                                key={item}
                                className={`${styles.skeletonLine} ${styles.sidebarSkeletonItem} ${widths[index]} ${styles.skeletonLineAnimated}`}
                                aria-hidden="true"
                            ></li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning>
        <head>
            <meta name="viewport" content="width=device-width,initial-scale=1" />
            
            {/* DNS预解析和预连接 - 加速外部资源加载 */}
            <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
            <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
            {/* Vercel Analytics 已移除 — 现在运行在 Cloudflare Workers */}
            
            {/* 主题初始化脚本 - 必须在所有CSS之前执行以防止闪动 */}
            <script dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        var theme = localStorage.getItem('theme');
                        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                            document.documentElement.classList.add('dark');
                        }
                    })();
                `
            }} />
            
            {/* iOS Safari 收藏夹图标 */}
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png" />
            {/* 已移除延迟加载，样式移至全局样式文件 */}
            
        </head>
        <body suppressHydrationWarning>
        <Providers>
            <div className="container">
                <header>
                    <h1>{siteConfig.title}</h1>
                    <p>{siteConfig.description}</p>
                    <div className={styles.headerActions}>
                        <ThemeToggle/>
                    </div>
                </header>
                <Navigation/>

                <div className="layout with-sidebar">
                    <div id="content-area" className={styles.contentWrapper}>
                        <Suspense fallback={<ContentLoading/>}>
                            {children}
                        </Suspense>
                    </div>
                    <aside>
                        <Suspense fallback={<SidebarSkeleton/>}>
                            <SidebarWrapper/>
                        </Suspense>
                    </aside>
                </div>

                <footer>
                    <p>{siteConfig.footer}</p>
                    <p style={{fontSize: '12px', opacity: 0.5, marginTop: '4px'}}>
                        Powered by <a href="https://github.com/cloudflare/vinext" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'underline'}}>Vinext</a>
                        {' '}v{__VINEXT_VERSION__} ({__GIT_HASH__})
                    </p>
                </footer>
            </div>
            <Suspense fallback={null}>
                <NavigationLoading />
            </Suspense>
        </Providers>
        </body>
        </html>
    );
}
