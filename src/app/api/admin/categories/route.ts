import { getCategories, saveCategories } from "@/lib/admin.server";

export async function GET() {
    const categories = await getCategories();
    return Response.json(categories, { headers: { "Cache-Control": "no-store" } });
}

export async function PUT(request: Request) {
    try {
        const { categories } = await request.json();

        if (!Array.isArray(categories)) {
            return Response.json({ error: "categories 必须是数组" }, { status: 400 });
        }

        for (const cat of categories) {
            if (!cat.slug?.trim() || !cat.name?.trim()) {
                return Response.json({ error: "每个分类必须有 slug 和 name" }, { status: 400 });
            }
        }

        // 检查 slug 唯一性
        const slugs = categories.map((c: { slug: string }) => c.slug);
        if (new Set(slugs).size !== slugs.length) {
            return Response.json({ error: "slug 不能重复" }, { status: 400 });
        }

        await saveCategories(categories);
        return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
    } catch {
        return Response.json({ error: "保存失败" }, { status: 500 });
    }
}
