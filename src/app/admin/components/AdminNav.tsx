"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, PlusCircle, Tag, ArrowLeft } from "lucide-react";
import styles from "../admin.module.css";

export default function AdminNav() {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    const links = [
        { href: "/admin", icon: FileText, label: "文章列表" },
        { href: "/admin/new", icon: PlusCircle, label: "新建文章" },
        { href: "/admin/categories", icon: Tag, label: "分类管理" },
    ];

    return (
        <div className={styles.adminHeader}>
            <Link href="/admin" className={styles.adminTitle}>
                后台管理
            </Link>
            <nav className={styles.adminNav}>
                {links.map(({ href, icon: Icon, label }) => (
                    <Link
                        key={href}
                        href={href}
                        className={`${styles.adminNavLink} ${mounted && pathname === href ? styles.adminNavLinkActive : ""}`}
                    >
                        <Icon size={16} />
                        {label}
                    </Link>
                ))}
                <Link href="/" className={styles.adminNavLink}>
                    <ArrowLeft size={16} />
                    返回博客
                </Link>
            </nav>
        </div>
    );
}
