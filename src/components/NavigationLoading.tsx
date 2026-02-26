"use client";
import {useEffect} from 'react';

let fadeTimer: ReturnType<typeof setTimeout> | null = null;

export default function NavigationLoading() {
    // Reset opacity on mount (including remount after RSC navigation)
    useEffect(() => {
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            contentArea.style.opacity = '1';
            contentArea.style.transition = '';
        }
    });

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
            if (href === window.location.pathname + window.location.search) return;

            const contentArea = document.getElementById('content-area');
            if (contentArea) {
                contentArea.style.transition = 'opacity 0.15s';
                contentArea.style.opacity = '0.4';
            }

            // Safety: always restore after 800ms max
            if (fadeTimer) clearTimeout(fadeTimer);
            fadeTimer = setTimeout(() => {
                const el = document.getElementById('content-area');
                if (el) {
                    el.style.opacity = '1';
                    el.style.transition = '';
                }
            }, 800);
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return null;
}
