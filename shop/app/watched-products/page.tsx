import { Suspense } from 'react'
import WatchedProductsPage from "@/components/templates/WatchedProductsPage/WatchedProductsPage"

export default function WatchedProducts() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WatchedProductsPage />
        </Suspense>
    )
}