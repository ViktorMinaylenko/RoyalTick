import {
  addProductToCartFx,
  removeCartItemFx,
  getCartItemsFx,
  updateCartItemQuantityFx,
} from '@/api/cart'
import { handleJWTError } from '@/lib/utils/errors'
import api from '../api/apiInstance'
import {
  IAddProductsFromLSToCartFx,
  IAddProductToCartFx,
  ICartItem,
  IDeleteCartItemsFx,
  IupdateCartItemQuantityFx,
} from '@/types/cart'
import { createDomain, createEffect, sample } from 'effector'
import toast from 'react-hot-toast'

export const addProductsFromLSToCartFx = createEffect(
  async ({ jwt, cartItems }: IAddProductsFromLSToCartFx) => {
    try {
      const { data } = await api.post(
        '/api/cart/add-many',
        { items: cartItems },
        {
          headers: { Authorization: `Bearer ${jwt}` },
        }
      )

      if (data?.error) {
        const newData: { cartItems: ICartItem[] } = await handleJWTError(
          data.error.name,
          {
            repeatRequestMethodName: 'addProductsFromLSToCartFx',
            payload: { items: cartItems },
          }
        )
        return newData
      }

      fetchCart({ jwt })
      return data
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
)

const cart = createDomain()

export const fetchCart = cart.createEvent<{ jwt: string }>()
export const setCartFromLS = cart.createEvent<ICartItem[]>()
export const addProductToCart = cart.createEvent<IAddProductToCartFx>()
export const addProductsFromLSToCart =
  cart.createEvent<IAddProductsFromLSToCartFx>()
export const updateCartItemQuantity = cart.createEvent<IupdateCartItemQuantityFx>()
export const setTotalPrice = cart.createEvent<number>()
export const deleteProductFromCart = cart.createEvent<IDeleteCartItemsFx>()
export const setShouldShowEmpty = cart.createEvent<boolean>()

export const $cart = cart
  .createStore<ICartItem[]>([])
  .on(getCartItemsFx.done, (_, { result }) => result)
  .on(addProductsFromLSToCartFx.done, (_, { result }) => result.items)
  .on(addProductToCartFx.done, (cart, { result }) => {
    if (!result || !result.newCartItem) {
      return cart
    }

    const updatedCart = [...cart, result.newCartItem]

    return [
      ...new Map(
        updatedCart
          .filter((item) => item && item.clientId)
          .map((item) => [item.clientId, item])
      ).values(),
    ]
  })
  .on(updateCartItemQuantityFx.done, (cart, { result }) =>
    cart.map((item) =>
      item._id === result.id ? { ...item, count: result.count } : item
    )
  )
  .on(removeCartItemFx.done, (cart, { result }) =>
    cart.filter((item) => item._id !== result.id)
  )

export const $cartFromLs = cart
  .createStore<ICartItem[]>([])
  .on(setCartFromLS, (_, cart) => cart)

export const $totalPrice = cart
  .createStore<number>(0)
  .on(setTotalPrice, (_, value) => value)

export const $shouldShowEmpty = cart
  .createStore(false)
  .on(setShouldShowEmpty, (_, value) => value)

sample({
  clock: fetchCart,
  source: $cart,
  fn: (_, data) => data,
  target: getCartItemsFx,
})

sample({
  clock: addProductToCart,
  source: $cart,
  fn: (_, data) => data,
  target: addProductToCartFx,
})

sample({
  clock: addProductsFromLSToCart,
  source: $cart,
  fn: (_, data) => data,
  target: addProductsFromLSToCartFx,
})

sample({
  clock: updateCartItemQuantity,
  source: $cart,
  fn: (_, data) => data,
  target: updateCartItemQuantityFx,
})

sample({
  clock: deleteProductFromCart,
  source: $cart,
  fn: (_, data) => data,
  target: removeCartItemFx,
})
