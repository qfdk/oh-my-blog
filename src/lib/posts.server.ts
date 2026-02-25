import { env } from "cloudflare:workers";

interface PostMeta {
    id: string;
    title: string;
    date: string;
    category: string;
    excerpt: string;
}

const POSTS_PER_PAGE = 4;

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}年${month}月${day}日`;
};

async function fetchPostIndex() {
    const raw = await env.BLOG_POSTS.get("posts:index", { type: "json" }) as PostMeta[] | null;
    if (!raw || !Array.isArray(raw)) return [];

    return raw.map(meta => ({
        id: meta.id,
        title: meta.title,
        date: formatDate(new Date(meta.date)),
        category: meta.category,
        excerpt: meta.excerpt,
        rawDate: meta.date,
    }));
}

export async function getAllPosts() {
    return fetchPostIndex();
}

export async function getCategoryStats() {
    const posts = await getAllPosts();
    return posts.reduce((acc, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
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
