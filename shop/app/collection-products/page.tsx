import { Suspense } from 'react'
import CollectionProductsPage from '@/components/templates/CollectionProductsPage/CollectionProductsPage'

export default function CollectionProducts() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CollectionProductsPage />
        </Suspense>
    )
}