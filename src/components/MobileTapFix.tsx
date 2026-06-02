"use client";
import {useEffect} from 'react';

// iOS Safari 在 SPA 导航后会间歇性不为干净的 tap 合成 click 事件，
// 导致导航/分页按钮"点了没反应"（尤其换页后的第一次点击）。
// 这里用 FastClick 思路兜底：对站内链接的干净 tap，主动触发一次确定性 click，
// 并取消 iOS 不可靠的合成 click，保证每次点击都能导航。
export default function MobileTapFix() {
    useEffect(() => {
        let startX = 0, startY = 0, startT = 0, startA: HTMLAnchorElement | null = null;

        const linkOf = (el: EventTarget | null) =>
            (el as HTMLElement)?.closest?.('a') as HTMLAnchorElement | null;

        const isInternalNav = (a: HTMLAnchorElement | null): a is HTMLAnchorElement => {
            if (!a) return false;
            const href = a.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('//')) return false;
            if (a.target && a.target !== '_self') return false;
            if (a.hasAttribute('download')) return false;
            return true;
        };

        const onTouchStart = (e: TouchEvent) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
            startT = e.timeStamp;
            startA = linkOf(e.target);
        };

        const onTouchEnd = (e: TouchEvent) => {
            const a = linkOf(e.target);
            if (!a || a !== startA || !isInternalNav(a) || !e.cancelable) return;
            const t = e.changedTouches[0];
            const moved = Math.hypot(t.clientX - startX, t.clientY - startY);
            const duration = e.timeStamp - startT;
            // 仅处理"干净的轻点"：位移小 + 时长短（保留滚动与长按选择/上下文菜单）
            if (moved >= 10 || duration > 500) return;
            e.preventDefault();   // 取消 iOS 不可靠的合成 click，避免重复触发
            a.click();            // 触发一次确定的 click，交给路由处理
        };

        document.addEventListener('touchstart', onTouchStart, {capture: true, passive: true});
        document.addEventListener('touchend', onTouchEnd, {capture: true, passive: false});

        return () => {
            document.removeEventListener('touchstart', onTouchStart, true);
            document.removeEventListener('touchend', onTouchEnd, true);
        };
    }, []);

    return null;
}
