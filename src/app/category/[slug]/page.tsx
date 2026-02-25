// src/app/category/[slug]/page.tsx
import styles from "./category.module.css";
import {getAllPosts} from "@/lib/posts.server";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {categoryNames} from "@/lib/constants";
import PageReady from "@/components/PageReady";

type MetadataProps = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    {params}: MetadataProps
): Promise<Metadata> {
    return {
        title: `${categoryNames[(await params).slug]} - 分类`,
        description: `查看 ${categoryNames[(await params).slug]} 分类下的所有文章`
    };
}

export default async function Page({params}: { params: { slug: string } }) {
    const slug = (await params).slug;
    const posts = (await getAllPosts()).filter(post => post.category === slug);

    if (posts.length === 0) {
        notFound();
    }

    return (
        <article className={styles.article}>
            <h1 className={styles.title}>
                {categoryNames[slug]}
                <span className={styles.count}>({posts.length})</span>
            </h1>

            <div className={styles.list}>
                {posts
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(post => (
                        <div key={post.id} className={styles.item}>
                            <a href={`/posts/${post.id}`} className={styles.link}>
                                {post.title}
                            </a>
                            <span className={styles.date}>
                                {post.date}
                            </span>
                        </div>
                    ))
                }
            </div>
            <PageReady/>
        </article>
    );
}
