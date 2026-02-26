// components/CategorySidebar.tsx
import Link from "next/link";
import {siteConfig} from "@/lib/constants";

interface CategorySidebarProps {
    categoryStats: Record<string, number>;
}

export default function CategorySidebar({categoryStats}: CategorySidebarProps) {
    return (
        <>
            <div className="widget">
                <h3>分类</h3>
                <ul>
                    {siteConfig.categories.map(category => (
                        <li key={category.slug}>
                            <Link href={`/category/${category.slug}`}
                                  prefetch={false}
                                  className="transition-colors hover:text-primary">
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
                            <a href={friend.url}
                               className="transition-colors hover:text-primary">
                                {friend.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}
