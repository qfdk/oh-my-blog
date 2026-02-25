// src/app/archive/page.tsx
import styles from "./archive.module.css";
import {getAllPosts} from "@/lib/posts.server";
import type {Metadata} from "next";
import Link from "next/link";
import PageReady from "@/components/PageReady";

export const metadata: Metadata = {
    title: "归档",
    description: "历史文章列表"
};

interface Post {
    id: string;
    title: string;
    date: string;
    rawDate: Date;
}

interface PostWithDay extends Post {
    day: number;
}

interface PostsByMonth {
    [month: string]: PostWithDay[];
}

interface PostsByYear {
    [year: number]: PostsByMonth;
}

export default async function ArchivePage() {
    const posts = await getAllPosts();
    const postsByYear = posts.reduce<PostsByYear>((acc, post) => {
        const date = new Date(post.rawDate);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        if (!acc[year]) {
            acc[year] = {};
        }

        const monthKey = month.toString().padStart(2, "0");
        if (!acc[year][monthKey]) {
            acc[year][monthKey] = [];
        }

        acc[year][monthKey].push({...post, day});
        return acc;
    }, {});

    const years = Object.keys(postsByYear)
        .map(Number)
        .sort((a, b) => b - a);

    const monthNames = [
        "一月", "二月", "三月", "四月", "五月", "六月",
        "七月", "八月", "九月", "十月", "十一月", "十二月"
    ];

    return (
        <article className={styles.article}>
            <h1 className={styles.title}>归档</h1>

            <div className={styles.timeline}>
                {years.map(year => (
                    <div key={year} className={styles.yearGroup}>
                        <h2 className={styles.year}>
                            {year} 年
                            <span className={styles.count}>
                                ({Object.values(postsByYear[year]).flat().length}篇)
                            </span>
                        </h2>
                        {Object.keys(postsByYear[year])
                            .sort((a, b) => b.localeCompare(a))
                            .map(month => (
                                <div key={`${year}-${month}`} className={styles.monthGroup}>
                                    <h3 className={styles.month}>
                                        {monthNames[parseInt(month) - 1]}
                                        <span className={styles.count}>
                                            ({postsByYear[year][month].length}篇)
                                        </span>
                                    </h3>
                                    <ul className={styles.posts}>
                                        {postsByYear[year][month]
                                            .sort((a, b) => b.day - a.day)
                                            .map(post => (
                                                <li key={post.id} className={styles.post}>
                                                    <Link
                                                        href={`/posts/${post.id}`}
                                                        className={styles.postTitle}
                                                    >
                                                        <span className={styles.date}>
                                                            {post.day.toString().padStart(2, "0")}日
                                                        </span>
                                                        {post.title}
                                                    </Link>
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            ))}
                    </div>
                ))}
            </div>
            <PageReady/>
        </article>
    );
}
