"use client";
import {useEffect, useRef} from 'react';
import {usePathname} from 'next/navigation';
import NProgress from 'nprogress';

NProgress.configure({
    showSpinner: false,
    speed: 300,
    minimum: 0.2,
    trickleSpeed: 100,
});

function shouldShowProgress(link: HTMLAnchorElement): boolean {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return false;
    if (href === window.location.pathname + window.location.search) return false;
    if (link.getAttribute('aria-disabled') === 'true') return false;
    if (link.closest('[data-pagination]')) return false;
    return true;
}

export default function NavigationLoading() {
    const ready = useRef(false);
    const pathname = usePathname();

    // 路由切换完成时结束进度条（覆盖没有 PageReady 的页面，如后台和 not-found）
    useEffect(() => {
        NProgress.done();
    }, [pathname]);

    useEffect(() => {
        NProgress.done();
        ready.current = true;

        const done = () => NProgress.done();
        window.addEventListener('page-ready', done);
        window.addEventListener('popstate', done);

        const handleClick = (e: MouseEvent) => {
            if (!ready.current) return;
            const link = (e.target as HTMLElement).closest('a');
            if (!link || !shouldShowProgress(link)) return;
            NProgress.start();
        };
        document.addEventListener('click', handleClick, true);

        return () => {
            window.removeEventListener('page-ready', done);
            window.removeEventListener('popstate', done);
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return null;
}
