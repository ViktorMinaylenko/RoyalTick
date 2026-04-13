import ProductPage from "@/components/templates/ProductPage/ProductPage";
import { itemCategories } from "@/constants/product";
import { notFound } from "next/navigation";

export default async function Product({
    params
}: {
    params: Promise<{ productId: string; category: string }>
}) {

    if (!itemCategories.includes((await params).category)) {
        notFound()
    }

    const { productId, category } = await params

    return <ProductPage productId={productId} category={category} />
}