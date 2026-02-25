"use client";
import {useEffect} from 'react';

let safetyTimer: ReturnType<typeof setTimeout> | null = null;
let showTime = 0;

function showOverlay() {
    if (document.getElementById('content-loading-overlay')) return;
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    showTime = Date.now();
    const overlay = document.createElement('div');
    overlay.id = 'content-loading-overlay';
    overlay.innerHTML = `
        <div class="content-spinner">
            <div class="content-spinner-ring"></div>
            <div class="content-spinner-center"></div>
        </div>
        <div class="content-spinner-text">载入中...</div>
    `;
    contentArea.appendChild(overlay);
}

function doHide() {
    const overlay = document.getElementById('content-loading-overlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 200);
    }
}

function hideOverlay() {
    if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
    }
    const elapsed = Date.now() - showTime;
    const remaining = 250 - elapsed;
    if (remaining > 0) {
        setTimeout(doHide, remaining);
    } else {
        doHide();
    }
}

export default function NavigationLoading() {
    useEffect(() => {
        const onPageReady = () => hideOverlay();
        window.addEventListener('page-ready', onPageReady);
        return () => window.removeEventListener('page-ready', onPageReady);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!href || href.startsWith('http') || href.startsWith('//') || href.startsWith('#')) return;
            if (href === window.location.pathname + window.location.search) return;
            if (link.getAttribute('aria-disabled') === 'true') return;

            // 导航去首页时不显示 overlay，由骨架屏处理
            if (href === '/' || href.startsWith('/?page=')) return;

            showOverlay();
            safetyTimer = setTimeout(hideOverlay, 800);
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return null;
}
