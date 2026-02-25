"use client";
import {useEffect} from 'react';

let safetyTimer: ReturnType<typeof setTimeout> | null = null;

function showOverlay() {
    if (document.getElementById('content-loading-overlay')) return;
    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    // 锁定内容区高度，防止 loading.tsx 返回 null 时内容区缩小跳动
    contentArea.style.minHeight = contentArea.offsetHeight + 'px';

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

function hideOverlay() {
    if (safetyTimer) {
        clearTimeout(safetyTimer);
        safetyTimer = null;
    }
    // 等浏览器绘制新内容后再淡出 overlay
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            const overlay = document.getElementById('content-loading-overlay');
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => {
                    overlay.remove();
                    // overlay 完全消失后再解锁高度
                    const contentArea = document.getElementById('content-area');
                    if (contentArea) contentArea.style.minHeight = '';
                }, 200);
            }
        });
    });
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

            showOverlay();
            safetyTimer = setTimeout(hideOverlay, 3000);
        };

        document.addEventListener('click', handleClick, true);
        return () => document.removeEventListener('click', handleClick, true);
    }, []);

    return null;
}
