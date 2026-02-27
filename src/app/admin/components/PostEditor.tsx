"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Save, Bold, Italic, Heading, Link2, ImageIcon, Code } from "lucide-react";
import Toast from "./Toast";
import styles from "../admin.module.css";

interface PostData {
    id: string;
    title: string;
    date: string;
    category: string;
    content: string;
}

interface CategoryItem {
    slug: string;
    name: string;
}

interface Props {
    mode: "new" | "edit";
    initialData?: PostData;
    categories?: CategoryItem[];
}

function getToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function PostEditor({ mode, initialData, categories: initialCategories }: Props) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [id, setId] = useState(initialData?.id ?? getToday());
    const [idManuallyEdited, setIdManuallyEdited] = useState(mode === "edit");
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [date, setDate] = useState(initialData?.date ?? getToday());
    const [category, setCategory] = useState(initialData?.category ?? "");
    const [content, setContent] = useState(initialData?.content ?? "");
    const [categories, setCategories] = useState<CategoryItem[]>(initialCategories ?? []);
    const [preview, setPreview] = useState("");
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [errors, setErrors] = useState<Set<string>>(new Set());

    // 客户端获取最新分类列表
    useEffect(() => {
        fetch("/api/admin/categories")
            .then(res => res.json())
            .then((data: CategoryItem[]) => {
                if (Array.isArray(data)) setCategories(data);
            })
            .catch(() => {});
    }, []);

    // Markdown 客户端预览（轻量，不用 shiki）
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const MarkdownIt = (await import("markdown-it")).default;
                const md = new MarkdownIt({ html: true, breaks: true, linkify: true });
                if (!cancelled) {
                    setPreview(md.render(content));
                }
            } catch {
                if (!cancelled) setPreview("<p>预览加载失败</p>");
            }
        })();
        return () => { cancelled = true; };
    }, [content]);

    const insertAtCursor = useCallback((before: string, after: string = "") => {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = content.substring(start, end);
        const replacement = `${before}${selected || "文本"}${after}`;
        const newContent = content.substring(0, start) + replacement + content.substring(end);
        setContent(newContent);
        requestAnimationFrame(() => {
            ta.focus();
            const cursor = start + before.length;
            ta.setSelectionRange(cursor, cursor + (selected || "文本").length);
        });
    }, [content]);

    const toolbar = [
        { icon: Bold, action: () => insertAtCursor("**", "**"), tip: "加粗" },
        { icon: Italic, action: () => insertAtCursor("*", "*"), tip: "斜体" },
        { icon: Heading, action: () => insertAtCursor("## "), tip: "标题" },
        { icon: Link2, action: () => insertAtCursor("[", "](url)"), tip: "链接" },
        { icon: ImageIcon, action: () => insertAtCursor("![alt](", ")"), tip: "图片" },
        { icon: Code, action: () => insertAtCursor("```\n", "\n```"), tip: "代码块" },
    ];

    const clearError = (field: string) => {
        if (errors.has(field)) {
            setErrors((prev) => { const next = new Set(prev); next.delete(field); return next; });
        }
    };

    const handleSave = async () => {
        const errs = new Set<string>();
        if (!id.trim()) errs.add("id");
        if (!title.trim()) errs.add("title");
        if (!date.trim()) errs.add("date");
        if (!category) errs.add("category");
        if (!content.trim()) errs.add("content");
        if (errs.size > 0) {
            setErrors(errs);
            return;
        }

        setErrors(new Set());
        setSaving(true);
        setStatus(null);

        try {
            const url = mode === "new" ? "/api/admin/posts" : `/api/admin/posts/${initialData?.id}`;
            const method = mode === "new" ? "POST" : "PUT";
            const body = { id, title, date, category, content };

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                setStatus({ type: "success", msg: "保存成功！" });
                setTimeout(() => {
                    window.location.href = "/admin";
                }, 800);
            } else {
                const data = await res.json().catch(() => ({}));
                setStatus({ type: "error", msg: data.error || "保存失败" });
            }
        } catch {
            setStatus({ type: "error", msg: "网络错误" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.editorPage}>
            {status && <Toast type={status.type} msg={status.msg} />}
            <div className={styles.toolbarTop}>
                <h2>{mode === "new" ? "新建文章" : "编辑文章"}</h2>
                <button className={styles.btnPrimary} onClick={handleSave} disabled={saving}>
                    <Save size={16} />
                    {saving ? "保存中..." : "保存"}
                </button>
            </div>

            <div className={styles.editorMeta}>
                <div className={styles.fieldGroup}>
                    <label>Slug (URL 路径)</label>
                    <input
                        type="text"
                        className={errors.has("id") ? styles.fieldError : undefined}
                        value={id}
                        onChange={(e) => {
                            setId(e.target.value);
                            setIdManuallyEdited(true);
                            clearError("id");
                        }}
                        placeholder="例如: my-first-post 或 2026-02-27"
                        disabled={mode === "edit"}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>标题</label>
                    <input
                        type="text"
                        className={errors.has("title") ? styles.fieldError : undefined}
                        value={title}
                        onChange={(e) => { setTitle(e.target.value); clearError("title"); }}
                        placeholder="文章标题"
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>日期</label>
                    <input
                        type="date"
                        className={errors.has("date") ? styles.fieldError : undefined}
                        value={date}
                        onChange={(e) => {
                            setDate(e.target.value);
                            clearError("date");
                            if (!idManuallyEdited && mode === "new") {
                                setId(e.target.value);
                            }
                        }}
                    />
                </div>
                <div className={styles.fieldGroup}>
                    <label>分类</label>
                    <select
                        className={errors.has("category") ? styles.fieldError : undefined}
                        value={category}
                        onChange={(e) => { setCategory(e.target.value); clearError("category"); }}
                    >
                        <option value="">请选择分类</option>
                        {categories.map((cat) => (
                            <option key={cat.slug} value={cat.slug}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.editorBody}>
                <div className={styles.editorPane}>
                    <div className={styles.editorPaneHeader}>
                        <span>Markdown</span>
                        <div className={styles.editorToolbar}>
                            {toolbar.map(({ icon: Icon, action, tip }) => (
                                <button key={tip} className={styles.toolbarBtn} onClick={action} title={tip}>
                                    <Icon size={15} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea
                        ref={textareaRef}
                        className={`${styles.editorTextarea}${errors.has("content") ? ` ${styles.fieldError}` : ""}`}
                        value={content}
                        onChange={(e) => { setContent(e.target.value); clearError("content"); }}
                        placeholder="在这里写 Markdown..."
                        spellCheck={false}
                    />
                </div>
                <div className={styles.editorPane}>
                    <div className={styles.editorPaneHeader}>
                        <span>预览</span>
                    </div>
                    <div
                        className={`${styles.editorPreview} content`}
                        dangerouslySetInnerHTML={{ __html: preview }}
                    />
                </div>
            </div>
        </div>
    );
}
