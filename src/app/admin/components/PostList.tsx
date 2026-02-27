"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";
import Toast from "./Toast";
import styles from "../admin.module.css";

interface PostMeta {
    id: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
}

interface Props {
    initialPosts: PostMeta[];
    categoryNames: Record<string, string>;
}

export default function PostList({ initialPosts, categoryNames: initialCategoryNames }: Props) {
    const [posts, setPosts] = useState(initialPosts);
    const [categoryNames, setCategoryNames] = useState(initialCategoryNames);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        // 获取最新文章列表和分类
        Promise.all([
            fetch("/api/admin/posts").then(r => r.json()),
            fetch("/api/admin/categories").then(r => r.json()),
        ]).then(([postsData, catsData]) => {
            if (Array.isArray(postsData)) setPosts(postsData);
            if (Array.isArray(catsData)) {
                setCategoryNames(Object.fromEntries(catsData.map((c: { slug: string; name: string }) => [c.slug, c.name])));
            }
        }).catch(() => {});
    }, []);

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 2000);
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`确定删除「${title}」？此操作不可撤销。`)) return;

        setDeleting(id);
        try {
            const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
            if (res.ok) {
                setPosts((prev) => prev.filter((p) => p.id !== id));
                showToast("success", "删除成功！");
            } else {
                showToast("error", "删除失败");
            }
        } catch {
            showToast("error", "网络错误");
        } finally {
            setDeleting(null);
        }
    };

    return (
        <>
        {toast && <Toast type={toast.type} msg={toast.msg} />}
        <div className={styles.toolbarTop}>
            <h2>文章管理 ({posts.length})</h2>
            <Link href="/admin/new" className={styles.btnPrimary}>
                <PlusCircle size={16} />
                新建文章
            </Link>
        </div>
        {posts.length === 0 ? (
            <div className={styles.emptyState}>
                <p>还没有文章，开始创作吧！</p>
            </div>
        ) : (
        <div className={styles.postTable}>
            <div className={styles.postTableHeader}>
                <span>标题</span>
                <span>日期</span>
                <span>分类</span>
                <span>操作</span>
            </div>
            {posts.map((post) => (
                <div key={post.id} className={styles.postTableRow}>
                    <span className={styles.postTitle}>{post.title}</span>
                    <span className={styles.postDate}>{post.date}</span>
                    <span>
                        <span className={styles.postCategory}>{categoryNames[post.category] || post.category}</span>
                    </span>
                    <span className={styles.postActions}>
                        <Link href={`/admin/edit/${post.id}`} className={styles.btnEdit}>
                            <Pencil size={14} />
                            编辑
                        </Link>
                        <button
                            className={styles.btnDelete}
                            onClick={() => handleDelete(post.id, post.title)}
                            disabled={deleting === post.id}
                        >
                            <Trash2 size={14} />
                            {deleting === post.id ? "..." : "删除"}
                        </button>
                    </span>
                </div>
            ))}
        </div>
        )}
        </>
    );
}
