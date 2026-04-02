import { itemCategories } from "@/constants/product"
import { notFound } from "next/navigation"

// 1. Робимо функцію асинхронною
export default async function Category({
    params
}: {
    params: Promise<{ category: string }>
}) {
    const resolvedParams = await params
    const category = resolvedParams.category

    const isCategoryValid = itemCategories.includes(category)

    if (!isCategoryValid) {
        notFound()
    }

    return <h1>{category}</h1>
}