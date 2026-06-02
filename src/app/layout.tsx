import {Suspense} from "react";
import "@/styles/globals.css";
import "@/components/Navigation/navigation.module.css";
import "@/components/ThemeToggle/style.module.css";
import "@/components/ArticleCard.module.css";
import "@/app/admin/admin.module.css";
import {siteConfig} from "@/lib/constants";
import Navigation from "@/components/Navigation";
import {getCategoryStats, getCategories} from "@/lib/posts.server";
import {Metadata} from "next";
import {Providers} from "@/components/Providers";
import {ThemeToggle} from "@/components/ThemeToggle";
import CategorySidebar from "@/components/CategorySidebar";
import NavigationLoading from "@/components/NavigationLoading";
import ContentLoading from "@/components/ContentLoading";
import MobileTapFix from "@/components/MobileTapFix";

import styles from "./layout.module.css";

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
    other: {
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'format-detection': 'telephone=no',
    }
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: 'white' },
        { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
    ]
};

const SidebarWrapper = async () => {
    const [categoryStats, categories] = await Promise.all([getCategoryStats(), getCategories()]);
    return <CategorySidebar key="sidebar" categories={categories} categoryStats={categoryStats}/>;
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
            <script dangerouslySetInnerHTML={{
                __html: `
                    (function() {
                        var d = document.documentElement;
                        d.style.opacity = '0';
                        var theme = localStorage.getItem('theme');
                        if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                            d.classList.add('dark');
                        }
                        if (location.pathname.startsWith('/admin')) {
                            d.classList.add('admin-mode');
                        }
                        function show() { d.style.opacity = ''; }
                        if (document.readyState === 'loading') {
                            document.addEventListener('DOMContentLoaded', show);
                        } else {
                            show();
                        }
                    })();
                `
            }} />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon.png" />
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

                <main className="layout with-sidebar">
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
                </main>

                <footer>
                    <p>{siteConfig.footer}</p>
                    <p className={styles.footerMeta}>
                        Powered by <a href="https://github.com/cloudflare/vinext" target="_blank" rel="noopener noreferrer">Vinext</a>
                        {' '}v{__VINEXT_VERSION__} ({__GIT_HASH__})
                    </p>
                </footer>
            </div>
            <Suspense fallback={null}>
                <NavigationLoading />
            </Suspense>
            <MobileTapFix />
        </Providers>
        </body>
        </html>
    );
}
