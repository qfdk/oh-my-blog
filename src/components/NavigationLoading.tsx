"use client";
import {useEffect} from 'react';
import NProgress from 'nprogress';

NProgress.configure({
    showSpinner: false,
    speed: 300,
    minimum: 0.2,
    trickleSpeed: 100,
});

function isInternalLink(link: HTMLAnchorElement): boolean {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return false;
    if (href === window.location.pathname + window.location.search) return false;
    if (link.getAttribute('aria-disabled') === 'true') return false;
    return true;
}

export default function NavigationLoading() {
    useEffect(() => {
        NProgress.done();
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link || !isInternalLink(link)) return;
            NProgress.start();
        };

        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
        };
    }, []);

    return null;
}
