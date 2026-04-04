import ProductsPage from "@/components/templates/ProductsPage/ProductsPage"
import { itemCategories } from "@/constants/product"
import { notFound } from "next/navigation"

export default async function Category({
    params,
    searchParams
}: {
    params: Promise<{ category: string }>
    searchParams: Promise<any>
}) {

    const resolvedParams = await params
    const category = resolvedParams.category

    if (!itemCategories.includes(category)) {
        notFound()
    }

    return (
        <ProductsPage
            searchParams={searchParams as any}
            pageName={category}
        />
    )
}