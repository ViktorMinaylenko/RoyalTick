'use client'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { IProduct } from '@/types/common'
import { useGoodsByAuth } from './useGoodsByAuth'
import { $favorites, $favoritesFromLS } from '@/context/favorites/state'
import { addProductToFavorites, setIsAddToFavorites } from '@/context/favorites/index'
import { productsWithoutSizes } from '@/constants/product'
import { handleShowSizeTable, isUserAuth } from '@/lib/utils/common'
import { addFavoriteItemToLS } from '@/lib/utils/favorites'


export const useFavoritesAction = (product: IProduct) => {
  const [addToFavoritesSpinner, setAddToFavoritesSpinner] = useState(false)
  const currentFavoritesByAuth = useGoodsByAuth($favorites, $favoritesFromLS)
  const existingItem = currentFavoritesByAuth.find(
    (item) => item.productId === product._id
  )

  const handleAddProductToFavorites = () => {
    if (productsWithoutSizes.includes(product.type)) {
      if (existingItem) {
        toast.success('Додано в обране!')
        return
      }

      if (!isUserAuth()) {
        addFavoriteItemToLS(product, '')
        return
      }

      const auth = JSON.parse(localStorage.getItem('auth') as string)
      const clientId = addFavoriteItemToLS(product, '', false)

      addProductToFavorites({
        jwt: auth.accessToken,
        productId: product._id,
        setSpinner: setAddToFavoritesSpinner,
        size: '',
        category: product.category,
        clientId,
      })
      return
    }

    setIsAddToFavorites(true)
    handleShowSizeTable(product)
  }

  return {
    handleAddProductToFavorites,
    addToFavoritesSpinner,
    setAddToFavoritesSpinner,
    isProductInFavorites: existingItem,
  }
}