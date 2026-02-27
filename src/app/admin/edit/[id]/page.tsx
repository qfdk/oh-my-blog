import { getPostRaw, getAllPostsMeta } from "@/lib/admin.server";
import { notFound } from "next/navigation";
import PostEditor from "../../components/PostEditor";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [raw, allMeta] = await Promise.all([
        getPostRaw(id),
        getAllPostsMeta(),
    ]);

    if (!raw) notFound();

    const meta = allMeta.find((p) => p.id === id);

    return (
        <PostEditor
            mode="edit"
            initialData={{
                id,
                title: meta?.title ?? "",
                date: meta?.date ?? "",
                category: meta?.category ?? "",
                content: raw,
            }}
        />
    );
}
