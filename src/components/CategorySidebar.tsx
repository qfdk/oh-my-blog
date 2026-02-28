// components/CategorySidebar.tsx
import Link from "next/link";
import {siteConfig} from "@/lib/constants";

interface CategorySidebarProps {
    categories?: { slug: string; name: string }[];
    categoryStats: Record<string, number>;
}

export default function CategorySidebar({categories, categoryStats}: CategorySidebarProps) {
    const cats = categories ?? siteConfig.categories;

    return (
        <>
            <div className="widget">
                <h3>分类</h3>
                <ul>
                    {cats.map(category => (
                        <li key={category.slug}>
                            <Link href={`/category/${category.slug}`}
                                  prefetch={false}>
                                {category.name} ({categoryStats[category.slug] || 0})
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="widget">
                <h3>友情链接</h3>
                <ul>
                    {siteConfig.friends.map(friend => (
                        <li key={friend.url}>
                            <a href={friend.url}>
                                {friend.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
