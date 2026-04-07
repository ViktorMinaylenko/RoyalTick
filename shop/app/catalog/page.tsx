import { Suspense } from 'react'
import ProductsPage from '@/components/templates/ProductsPage/ProductsPage'
import { SearchParams } from '@/types/catalog'

export default function Catalog({
    searchParams,
}: {
    searchParams?: SearchParams
}) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsPage searchParams={searchParams || {}} pageName='catalog' />
        </Suspense>
    )
}