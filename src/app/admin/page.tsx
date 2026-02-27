import { getAllPostsMeta, getCategories } from "@/lib/admin.server";
import PostList from "./components/PostList";

export default async function AdminPage() {
    const [posts, categories] = await Promise.all([getAllPostsMeta(), getCategories()]);
    const categoryNames = Object.fromEntries(categories.map(c => [c.slug, c.name]));

    return <PostList initialPosts={posts} categoryNames={categoryNames} />;
}
