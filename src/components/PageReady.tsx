"use client";
import {useEffect} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

export default function PageReady() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        window.dispatchEvent(new Event('page-ready'));
    }, [pathname, searchParams]);
    return null;
}
