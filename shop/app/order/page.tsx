import OrderPage from '@/components/templates/OrderPage/OrderPage'
import { Suspense } from 'react'

export default function Order() {
  return (
    <Suspense fallback={null}>
      <OrderPage />
    </Suspense>
  )
}