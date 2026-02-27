import { NextResponse } from "next/server";
import { getPostRaw, getAllPostsMeta, savePost, deletePost } from "@/lib/admin.server";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const [raw, allMeta] = await Promise.all([
            getPostRaw(id),
            getAllPostsMeta(),
        ]);

        if (!raw) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        const meta = allMeta.find((p) => p.id === id);
        return NextResponse.json({
            id,
            title: meta?.title ?? "",
            date: meta?.date ?? "",
            category: meta?.category ?? "",
            content: raw,
        }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to get post:", error);
        return NextResponse.json({ error: "Failed to get post" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { title, date, category, content } = body;

        if (!title || !date || !category || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await savePost(id, title, date, category, content);
        return NextResponse.json({ success: true, id }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to update post:", error);
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const deleted = await deletePost(id);

        if (!deleted) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to delete post:", error);
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }
}
