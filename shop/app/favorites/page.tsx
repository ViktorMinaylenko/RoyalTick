import FavoritesPage from '@/components/templates/FavoritesPage/FavoritesPage'
import { Suspense } from 'react'

export default function Home() {
  <Suspense fallback={<div />}>
    <FavoritesPage />
  </Suspense>
}
