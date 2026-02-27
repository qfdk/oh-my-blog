import { getCategories } from "@/lib/admin.server";
import CategoryManager from "../components/CategoryManager";

export default async function CategoriesPage() {
    const categories = await getCategories();
    return <CategoryManager initialCategories={categories} />;
}
