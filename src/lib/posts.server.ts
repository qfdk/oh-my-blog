import { env } from "cloudflare:workers";
import { siteConfig } from "./constants";
import type { PostMeta } from "@/types/post";

const POSTS_PER_PAGE = 4;

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}年${month}月${day}日`;
};

export async function getCategories(): Promise<{ slug: string; name: string }[]> {
    const raw = await env.BLOG_POSTS.get("categories:index", { type: "json" }) as { slug: string; name: string }[] | null;
    return raw && Array.isArray(raw) ? raw : siteConfig.categories;
}

async function fetchPostIndex() {
    const [raw, categories] = await Promise.all([
        env.BLOG_POSTS.get("posts:index", { type: "json" }) as Promise<PostMeta[] | null>,
        getCategories(),
    ]);
    if (!raw || !Array.isArray(raw)) return [];

    const categoryMap: Record<string, string> = Object.create(null);
    for (const c of categories) categoryMap[c.slug] = c.name;

    return raw.map(meta => ({
        id: meta.id,
        title: meta.title,
        date: formatDate(new Date(`${meta.date}T00:00:00Z`)),
        category: meta.category,
        categoryName: categoryMap[meta.category] || meta.category,
        excerpt: meta.excerpt,
        rawDate: meta.date,
    }));
}

export async function getAllPosts() {
    return fetchPostIndex();
}

export async function getCategoryStats() {
    const posts = await getAllPosts();
    const stats: Record<string, number> = Object.create(null);
    for (const post of posts) stats[post.category] = (stats[post.category] || 0) + 1;
    return stats;
}

export async function getPaginatedPosts(page: number = 1) {
    const allPosts = await getAllPosts();
    const totalPosts = allPosts.length;
    const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
    const validPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (validPage - 1) * POSTS_PER_PAGE;
    const paginatedPosts = allPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

    return {
        posts: paginatedPosts,
        pagination: {
            currentPage: validPage,
            totalPages,
            totalPosts
        }
    };
}

export async function getPostById(id: string) {
    try {
        const markdownContent = await env.BLOG_POSTS.get(`posts:content:${id}`);
        if (!markdownContent) return null;

        const allPosts = await getAllPosts();
        const meta = allPosts.find(p => p.id === id);
        if (!meta) return null;

        return {
            id,
            title: meta.title,
            date: meta.date,
            category: meta.category,
            categoryName: meta.categoryName,
            content: markdownContent,
            excerpt: meta.excerpt,
        };
    } catch (error) {
        console.error("Error in getPostById:", error);
        return null;
    }
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

    return {
        pages: Array.from({ length: Math.min(3, totalPages) }, (_, i) => ({
            page: (i + 1).toString()
        })),
        posts: posts.slice(0, 10).map(post => ({
            id: post.id
        }))
    };
}
