import { addProductToCartFx, removeCartItemFx, getCartItemsFx } from '@/context/cart/index'
import { JWTError } from '@/constants/jwt'
import { addProductsFromLSToCartFx } from '@/context/cart/index'
import { addItemsFromLSToComparisonFx, addItemToComparisonFx, deleteComparisonItemFx, getComparisonItemsFx } from '@/context/comparison/index'
import { addProductsFromLSToFavoritesFx, addProductToFavoriteFx, deleteFavoriteItemFx, getFavoriteItemsFx } from '@/context/favorites/index'
import { loginCheckFx, refreshToken } from '@/context/user/index'
import { IAddProductsFromLSToCartFx, IAddProductToCartFx, IDeleteCartItemsFx } from '@/types/cart'
import { IAddItemsFromLSToComparisonFx, IAddItemToComparisonFx, IDeleteComparisonItemsFx } from '@/types/comparison'
import { IAddProductsFromLSToFavoriteFx, IDeleteFavoriteItemsFx } from '@/types/favorites'

export const handleJWTError = async (
  errorName: string,
  repeatRequestAfterRefreshData?: {
    repeatRequestMethodName: string
    payload?: unknown
  }
) => {
  if (errorName === JWTError.EXPIRED_JWT_TOKEN) {
    const auth = JSON.parse(localStorage.getItem('auth') as string)
    const newTokens = await refreshToken({ jwt: auth.refreshToken })

    if (repeatRequestAfterRefreshData) {
      const { repeatRequestMethodName, payload } = repeatRequestAfterRefreshData

      switch (repeatRequestMethodName) {
        case 'getCartItemsFx':
          return getCartItemsFx({
            jwt: newTokens.accessToken,
          })
        case 'addProductToCartFx':
          return addProductToCartFx({
            ...(payload as IAddProductToCartFx),
            jwt: newTokens.accessToken,
          })
        case 'addProductsFromLSToCartFx':
          return addProductsFromLSToCartFx({
            ...(payload as IAddProductsFromLSToCartFx),
            jwt: newTokens.accessToken,
          })
        case 'removeCartItemFx':
          return removeCartItemFx({
            ...(payload as IDeleteCartItemsFx),
            jwt: newTokens.accessToken,
          })
        case 'getFavoriteItemsFx':
          return getFavoriteItemsFx({
            jwt: newTokens.accessToken,
          })
        case 'addProductsFromLSToFavoritesFx':
          return addProductsFromLSToFavoritesFx({
            ...(payload as IAddProductsFromLSToFavoriteFx),
            jwt: newTokens.accessToken,
          })
        case 'addProductToFavoriteFx':
          return addProductToFavoriteFx({
            ...(payload as Omit<IAddProductToCartFx, 'count'>),
            jwt: newTokens.accessToken,
          })
        case 'deleteFavoriteItemFx':
          return deleteFavoriteItemFx({
            ...(payload as IDeleteFavoriteItemsFx),
            jwt: newTokens.accessToken,
          })
        case 'addItemToComparisonFx':
          return addItemToComparisonFx({
            ...(payload as IAddItemToComparisonFx),
            jwt: newTokens.accessToken,
          })
        case 'getComparisonItemsFx':
          return getComparisonItemsFx({
            jwt: newTokens.accessToken,
          })
        case 'deleteComparisonItemFx':
          return deleteComparisonItemFx({
            ...(payload as IDeleteComparisonItemsFx),
            jwt: newTokens.accessToken,
          })
        case 'addItemsFromLSToComparisonFx':
          return addItemsFromLSToComparisonFx({
            ...(payload as IAddItemsFromLSToComparisonFx),
            jwt: newTokens.accessToken,
          })
        case 'loginCheckFx':
          await loginCheckFx({
            jwt: newTokens.accessToken,
          })
          break
      }
    }
  }
}
