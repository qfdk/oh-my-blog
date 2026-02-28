"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Toast from "./Toast";
import styles from "../admin.module.css";
import type { CategoryItem } from "@/types/post";

export default function CategoryManager({ initialCategories }: { initialCategories: CategoryItem[] }) {
    const [categories, setCategories] = useState(initialCategories);

    useEffect(() => {
        fetch("/api/admin/categories")
            .then(res => res.json())
            .then((data: CategoryItem[]) => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(() => {});
    }, []);
    const [slug, setSlug] = useState("");
    const [name, setName] = useState("");
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [errors, setErrors] = useState<Set<string>>(new Set());

    const showToast = (type: "success" | "error", msg: string) => {
        setToast({ type, msg });
        setTimeout(() => setToast(null), 2000);
    };

    const save = async (updated: CategoryItem[]) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/categories", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ categories: updated }),
            });
            if (res.ok) {
                setCategories(updated);
                showToast("success", "保存成功！");
            } else {
                const data = await res.json().catch(() => ({}));
                showToast("error", data.error || "保存失败");
            }
        } catch {
            showToast("error", "网络错误");
        } finally {
            setSaving(false);
        }
    };

    const handleAdd = () => {
        const errs = new Set<string>();
        if (!slug.trim()) errs.add("slug");
        if (!name.trim()) errs.add("name");
        if (errs.size > 0) {
            setErrors(errs);
            return;
        }
        if (categories.some((c) => c.slug === slug.trim())) {
            showToast("error", "该 slug 已存在");
            return;
        }
        const updated = [...categories, { slug: slug.trim(), name: name.trim() }];
        save(updated);
        setSlug("");
        setName("");
        setErrors(new Set());
    };

    const handleDelete = (targetSlug: string, targetName: string) => {
        if (!confirm(`确定删除分类「${targetName}」？`)) return;
        const updated = categories.filter((c) => c.slug !== targetSlug);
        save(updated);
    };

    return (
        <>
            {toast && <Toast type={toast.type} msg={toast.msg} />}
            <div className={styles.toolbarTop}>
                <h2>分类管理 ({categories.length})</h2>
            </div>
            <div className={styles.categoryAddForm}>
                <input
                    type="text"
                    className={errors.has("slug") ? styles.fieldError : undefined}
                    value={slug}
                    onChange={(e) => { setSlug(e.target.value); setErrors(prev => { const next = new Set(prev); next.delete("slug"); return next; }); }}
                    placeholder="slug (如: tech)"
                    disabled={saving}
                />
                <input
                    type="text"
                    className={errors.has("name") ? styles.fieldError : undefined}
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors(prev => { const next = new Set(prev); next.delete("name"); return next; }); }}
                    placeholder="显示名称 (如: 技术分享)"
                    disabled={saving}
                />
                <button className={styles.btnPrimary} onClick={handleAdd} disabled={saving}>
                    <Plus size={16} />
                    添加
                </button>
            </div>
            <div className={styles.postTable}>
                <div className={styles.categoryTableHeader}>
                    <span>Slug</span>
                    <span>名称</span>
                    <span>操作</span>
                </div>
                {categories.map((cat) => (
                    <div key={cat.slug} className={styles.categoryTableRow}>
                        <span className={styles.categorySlug}>{cat.slug}</span>
                        <span>{cat.name}</span>
                        <span>
                            <button
                                className={styles.btnDelete}
                                onClick={() => handleDelete(cat.slug, cat.name)}
                                disabled={saving}
                            >
                                <Trash2 size={14} />
                                删除
                            </button>
                        </span>
                    </div>
                ))}
                {categories.length === 0 && (
                    <div className={styles.emptyState}>
                        <p>还没有分类，添加一个吧！</p>
                    </div>
                )}
            </div>
        </>
    );
}
