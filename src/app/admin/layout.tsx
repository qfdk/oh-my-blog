"use client";

import { useEffect } from "react";
import AdminNav from "./components/AdminNav";
import styles from "./admin.module.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // head 脚本处理刷新场景，这里处理客户端导航进入 admin 的场景
        document.documentElement.classList.add("admin-mode");
        return () => {
            document.documentElement.classList.remove("admin-mode");
        };
    }, []);

    return (
        <div className={styles.adminLayout}>
            <AdminNav />
            {children}
        </div>
    );
}
