"use client";
import {useEffect} from 'react';

export default function PageReady() {
    useEffect(() => {
        window.dispatchEvent(new Event('page-ready'));
    }, []);
    return null;
}
