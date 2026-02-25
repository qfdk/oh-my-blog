"use client";
import {usePathname} from "next/navigation";
import PostsListLoading from "@/components/PostsListLoading";

export default function ContentLoading() {
    const pathname = usePathname();

    // 只有首页用骨架屏，其他页面由 overlay spinner 处理
    if (pathname === "/" || pathname.startsWith("/?page=")) {
        return <PostsListLoading/>;
    }

    return null;
}
