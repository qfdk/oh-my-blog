import { NextResponse } from "next/server";
import { getAllPostsMeta, savePost } from "@/lib/admin.server";

export async function GET() {
    try {
        const posts = await getAllPostsMeta();
        return NextResponse.json(posts, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to list posts:", error);
        return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { id, title, date, category, content } = body;

        if (!id || !title || !date || !category || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await savePost(id, title, date, category, content);
        return NextResponse.json({ success: true, id }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
        console.error("Failed to create post:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
}
