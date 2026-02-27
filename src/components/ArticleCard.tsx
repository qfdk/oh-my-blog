import Link from "next/link";
import {memo} from "react";
import styles from "./ArticleCard.module.css";

interface ArticleProps {
    id: string;
    title: string;
    date: string;
    category: string;
    categoryName?: string;
    excerpt: string;
}

function ArticleCard({id, title, date, categoryName, category, excerpt}: ArticleProps) {
    return (
        <article className="article article-card">
            <h2 className={styles.title}>
                <Link href={`/posts/${id}`} prefetch={false}>{title}</Link>
            </h2>
            <div className="meta">发布于 {date} | 分类：{categoryName || category}</div>
            <div className="excerpt" dangerouslySetInnerHTML={{__html: excerpt}}/>
            <div className="read-more">
                <Link href={`/posts/${id}`} prefetch={false}>继续阅读</Link>
            </div>
        </article>
    );
}

function arePropsEqual(prevProps: ArticleProps, nextProps: ArticleProps) {
    return (
        prevProps.id === nextProps.id &&
        prevProps.title === nextProps.title &&
        prevProps.date === nextProps.date &&
        prevProps.category === nextProps.category &&
        prevProps.categoryName === nextProps.categoryName &&
        prevProps.excerpt === nextProps.excerpt
    );
}

export default memo(ArticleCard, arePropsEqual);
