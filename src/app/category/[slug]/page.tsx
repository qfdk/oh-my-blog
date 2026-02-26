// src/app/category/[slug]/page.tsx
import styles from "./category.module.css";
import {getAllPosts} from "@/lib/posts.server";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {categoryNames, siteConfig} from "@/lib/constants";
import Link from "next/link";
import PageReady from "@/components/PageReady";

type MetadataProps = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    {params}: MetadataProps
): Promise<Metadata> {
    const slug = (await params).slug;
    const name = categoryNames[slug];
    if (!name) return { title: "分类未找到" };
    return {
        title: `${name} - 分类`,
        description: `查看 ${name} 分类下的所有文章`
    };
}

export default async function Page({params}: { params: { slug: string } }) {
    const slug = (await params).slug;
    const validSlugs = siteConfig.categories.map(c => c.slug);

    if (!validSlugs.includes(slug)) {
        notFound();
    }

    const posts = (await getAllPosts()).filter(post => post.category === slug);

    return (
        <article className={styles.article}>
            <h1 className={styles.title}>
                {categoryNames[slug]}
                <span className={styles.count}>({posts.length})</span>
            </h1>

            {posts.length === 0 ? (
                <div className={styles.empty}>该分类下暂无文章</div>
            ) : (
                <div className={styles.list}>
                    {posts
                        .sort((a, b) => b.rawDate.localeCompare(a.rawDate))
                        .map(post => (
                            <div key={post.id} className={styles.item}>
                                <Link href={`/posts/${post.id}`} className={styles.link} prefetch={false}>
                                    {post.title}
                                </Link>
                                <span className={styles.date}>
                                    {post.date}
                                </span>
                            </div>
                        ))
                    }
                </div>
            )}
            <PageReady/>
        </article>
    );
}
