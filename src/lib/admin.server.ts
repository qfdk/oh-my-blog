import { env } from "cloudflare:workers";
import { renderMarkdown, extractExcerpt } from "./markdown-utils";
import { siteConfig } from "./constants";
import type { PostMeta, CategoryItem } from "@/types/post";

export async function getCategories(): Promise<CategoryItem[]> {
    const raw = await env.BLOG_POSTS.get("categories:index", { type: "json" }) as CategoryItem[] | null;
    return raw && Array.isArray(raw) ? raw : siteConfig.categories;
}

export async function saveCategories(categories: CategoryItem[]): Promise<void> {
    await env.BLOG_POSTS.put("categories:index", JSON.stringify(categories));
}

async function getIndex(): Promise<PostMeta[]> {
    const raw = await env.BLOG_POSTS.get("posts:index", { type: "json" }) as PostMeta[] | null;
    return raw && Array.isArray(raw) ? raw : [];
}

async function putIndex(index: PostMeta[]): Promise<void> {
    await env.BLOG_POSTS.put("posts:index", JSON.stringify(index));
}

export async function getPostRaw(id: string): Promise<string | null> {
    return env.BLOG_POSTS.get(`posts:raw:${id}`);
}

export async function getAllPostsMeta(): Promise<PostMeta[]> {
    return getIndex();
}

export async function savePost(
    id: string,
    title: string,
    date: string,
    category: string,
    markdown: string
): Promise<void> {
    const html = await renderMarkdown(markdown);
    const excerpt = extractExcerpt(markdown);

    await Promise.all([
        env.BLOG_POSTS.put(`posts:raw:${id}`, markdown),
        env.BLOG_POSTS.put(`posts:content:${id}`, html),
    ]);

    const index = await getIndex();
    const existing = index.findIndex((p) => p.id === id);
    const meta: PostMeta = { id, title, date, category, excerpt };

    if (existing >= 0) {
        index[existing] = meta;
    } else {
        index.push(meta);
    }

    index.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    await putIndex(index);
}

export async function deletePost(id: string): Promise<boolean> {
    const index = await getIndex();
    const filtered = index.filter((p) => p.id !== id);

    if (filtered.length === index.length) return false;

    await Promise.all([
        env.BLOG_POSTS.delete(`posts:raw:${id}`),
        env.BLOG_POSTS.delete(`posts:content:${id}`),
        putIndex(filtered),
    ]);

    return true;
}
