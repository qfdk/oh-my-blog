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
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (!ready.current) return;
            const link = (e.target as HTMLElement).closest('a');
            if (!link || !shouldShowProgress(link)) return;
            setTimeout(() => NProgress.start(), 0);
        };

        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return null;
}
