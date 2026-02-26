"use client";
import {useEffect, useRef} from 'react';
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

    useEffect(() => {
        NProgress.done();
        ready.current = true;

        // Hook vinext RSC 导航，在导航完成后结束进度条
        const win = window as Record<string, unknown>;
        const original = win.__VINEXT_RSC_NAVIGATE__ as ((url: string) => Promise<void>) | undefined;
        if (original) {
            win.__VINEXT_RSC_NAVIGATE__ = async (url: string) => {
                try {
                    await original(url);
                } finally {
                    NProgress.done();
                }
            };
        }

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
            if (original) win.__VINEXT_RSC_NAVIGATE__ = original;
            window.removeEventListener('page-ready', done);
            window.removeEventListener('popstate', done);
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return null;
}
