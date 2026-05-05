import { $isAuth } from '@/context/auth/state'
import { $favorites, $favoritesFromLS } from '@/context/favorites/state'
import { useUnit } from 'effector-react'

export const useFavoritesByAuth = () => {
  const favorites = useUnit($favorites)
  const isAuth = useUnit($isAuth)
  const favoritesFromLs = useUnit($favoritesFromLS)
  const currentFavoritesByAuth = isAuth ? favorites : favoritesFromLs

  return currentFavoritesByAuth
}
