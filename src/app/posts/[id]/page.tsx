// src/app/posts/[id]/page.tsx
import {getAllPosts, getPostById} from "@/lib/posts.server";
import {notFound} from "next/navigation";
import {categoryNames} from "@/lib/constants";
import {Metadata} from "next";
import ArticleContent from "@/components/ArticleContent";
import PageReady from "@/components/PageReady";
import styles from "./post.module.css";

export async function generateMetadata({params}: { params: { id: string } }): Promise<Metadata> {
    const post = await getPostById((await params).id);

    if (!post) {
        return {
            title: "Post Not Found"
        };
    }

    return {
        title: post.title,
        description: post.excerpt || post.title
    };
}

export async function generateStaticParams() {
    const posts = await getAllPosts();
    return posts.map((post) => ({
        id: post.id
    }));
}

export default async function Post({params}: { params: { id: string } }) {
    const post = await getPostById((await params).id);

    if (!post) {
        notFound();
    }

    return (
        <article className="article article-single">
            <header>
                <h1 className="title">{post.title}</h1>
                <div className="meta">
                    <time dateTime={post.date}>发布于 {post.date}</time>
                    {post.category && (
                        <>
                            <span className={styles.metaSeparator}>|</span>
                            <span>分类：{categoryNames[post.category]}</span>
                        </>
                    )}
                </div>
            </header>

            <ArticleContent content={post.content}/>
            <PageReady/>
        </article>
    );
}
