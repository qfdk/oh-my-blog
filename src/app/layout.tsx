// src/app/layout.tsx
import {Suspense} from "react";
import "./globals.css";
import {siteConfig} from "@/lib/constants";
import Navigation from "@/components/Navigation";
import {getCategoryStats} from "@/lib/posts.server";
import {Metadata} from "next";
import Loading from "@/components/Loading";
import {Providers} from "@/components/Providers";
import {ThemeToggle} from "@/components/ThemeToggle";
import CategorySidebar from "@/components/CategorySidebar";

import {Inter} from "next/font/google";

// 优化字体加载，只加载必要的字重
const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    weight: ["400", "700"],
    preload: true,
    fallback: ["system-ui", "sans-serif"]
});

export const metadata: Metadata = {
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.title}`
    },
    description: siteConfig.description,
    metadataBase: new URL('https://blog.qfdk.me'),
    // 添加其他元数据提高性能
    other: {
        'apple-mobile-web-app-capable': 'yes',
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
    return (
        <aside className="w-64 p-6 space-y-8 border-r border-gray-200 dark:border-gray-800 min-h-screen">
            {/* 分类标题骨架 */}
            <div className="mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse"/>
            </div>

            {/* 分类列表骨架 */}
            <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="flex items-center justify-between">
                        <div
                            className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
                            style={{width: `${Math.random() * 30 + 60}%`}}
                        />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-6 animate-pulse"/>
                    </div>
                ))}
            </div>

            {/* 友情链接标题骨架 */}
            <div className="mt-8 mb-4">
                <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse"/>
            </div>

            {/* 友情链接列表骨架 */}
            <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"
                        style={{width: `${Math.random() * 20 + 70}%`}}
                    />
                ))}
            </div>
        </aside>
    );
};

export default function RootLayout({children}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN" suppressHydrationWarning className={inter.className}>
        <head>
            {/* 添加关键CSS内联样式 */}
            <style dangerouslySetInnerHTML={{ __html: `
                :root{--max-width:960px;--primary-color:#333;--primary-hover:#000;--bg-color:#f5f5f5;--meta-color:#666;--shadow:0 2px 5px rgba(0,0,0,0.1);--article-bg:white;--nav-bg:white}
                @media screen and (min-width:1513px){:root{--max-width:960px}}
                :root[class~="dark"]{--primary-color:#e1e1e1;--primary-hover:#fff;--bg-color:#1a1a1a;--meta-color:#9ca3af;--shadow:0 2px 5px rgba(0,0,0,0.2);--article-bg:#1e293b;--nav-bg:#1e293b}
                body{min-height:100vh;background-color:var(--bg-color)}
                .container{max-width:var(--max-width);margin:0 auto}
                .layout{display:grid;grid-template-columns:1fr auto;gap:2rem}
            `}} />
        </head>
        <body className="min-h-screen antialiased" suppressHydrationWarning>
        <Providers>
            <div className="container transition-colors duration-300">
                <header className="py-8 text-center relative dark:border-gray-800 bg-background">
                    <div className="max-w-4xl mx-auto px-4">
                        <h1 className="text-3xl font-bold mb-2">
                            {siteConfig.title}
                        </h1>
                        <p className="text-muted-foreground">
                            {siteConfig.description}
                        </p>
                    </div>
                    <div className="absolute right-4 top-4">
                        <ThemeToggle/>
                    </div>
                </header>
                <Navigation/>

                <div className="layout with-sidebar">
                    <Suspense fallback={<Loading/>}>
                        {children}
                    </Suspense>
                    <Suspense fallback={<SidebarSkeleton/>}>
                        <SidebarWrapper/>
                    </Suspense>
                </div>

                <footer className="py-8 text-center border-t dark:border-gray-800 bg-background">
                    <p className="text-muted-foreground">{siteConfig.footer}</p>
                </footer>
            </div>
        </Providers>
        </body>
        </html>
    );
}
