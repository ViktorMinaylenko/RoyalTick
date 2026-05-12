'use client'

import { handleJWTError } from "@/lib/utils/errors"
import { ICartItem, IAddProductToCartFx, IAddProductsFromLSToCartFx, IupdateCartItemQuantityFx, IDeleteCartItemsFx } from "@/types/cart"
import { createDomain, createEffect } from "effector"
import toast from "react-hot-toast"
import api from '@/api/apiInstance'

export const cart = createDomain()

export const fetchCart = cart.createEvent<{ jwt: string }>()
export const setCartFromLS = cart.createEvent<ICartItem[]>()
export const addProductToCart = cart.createEvent<IAddProductToCartFx>()
export const addProductsFromLSToCart =
    cart.createEvent<IAddProductsFromLSToCartFx>()
export const updateCartItemQuantity = cart.createEvent<IupdateCartItemQuantityFx>()
export const setTotalPrice = cart.createEvent<number>()
export const deleteProductFromCart = cart.createEvent<IDeleteCartItemsFx>()
export const setShouldShowEmpty = cart.createEvent<boolean>()
export const deleteAllFromCart = cart.createEvent<{ jwt: string }>()

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
            return { cartItems: [] }
        }
    }
)

export const getCartItemsFx = createEffect(async ({ jwt }: { jwt: string }) => {
    try {
        const { data } = await api.get('/api/cart/all', {
            headers: { Authorization: `Bearer ${jwt}` },
        })

        if (data?.error) {
            const newData: ICartItem[] = await handleJWTError(data.error.name, {
                repeatRequestMethodName: 'getCartItemsFx',
            })

            return newData
        }

        return data
    } catch (error) {
        toast.error((error as Error).message)
        return []
    }
})

export const addProductToCartFx = createEffect(
    async ({ jwt, setSpinner, ...dataFields }: IAddProductToCartFx) => {
        try {
            setSpinner(true)
            const { data } = await api.post('/api/cart/add', dataFields, {
                headers: { Authorization: `Bearer ${jwt}` },
            })

            if (data?.error) {
                const newData: { newCartItem: ICartItem } = await handleJWTError(
                    data.error.name,
                    {
                        repeatRequestMethodName: 'addProductToCartFx',
                        payload: { ...dataFields, setSpinner },
                    }
                )
                return newData
            }
            toast.success('Додано в кошик!')
            return data
        } catch (error) {
            toast.error((error as Error).message)
            return { newCartItem: {} as ICartItem }
        } finally {
            setSpinner(false)
        }
    }
)

export const updateCartItemQuantityFx = createEffect(
    async ({ jwt, id, setSpinner, count }: IupdateCartItemQuantityFx) => {
        try {
            setSpinner(true)
            const { data } = await api.patch(
                `/api/cart/count?id=${id}`,
                { count },
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            )

            if (data?.error) {
                const newData: { count: string; id: string } = await handleJWTError(
                    data.error.name,
                    {
                        repeatRequestMethodName: 'updateCartItemQuantityFx',
                        payload: { id, setSpinner, count },
                    }
                )
                return newData
            }
            return data
        } catch (error) {
            toast.error((error as Error).message)
            return { count: '0', id: '' }
        } finally {
            setSpinner(false)
        }
    }
)

export const removeCartItemFx = createEffect(
    async ({ jwt, id, setSpinner }: IDeleteCartItemsFx) => {
        try {
            setSpinner(true)
            const { data } = await api.delete(`/api/cart/delete?id=${id}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            })

            if (data?.error) {
                const newData: { id: string } = await handleJWTError(data.error.name, {
                    repeatRequestMethodName: 'removeCartItemFx',
                    payload: { id, setSpinner },
                })
                return newData
            }

            toast.success('Товар видалено з кошика!')
            return data
        } catch (error) {
            toast.error((error as Error).message)
            return { id: '' }
        } finally {
            setSpinner(false)
        }
    }
)

export const deleteAllFromCartFx = createEffect(
    async ({jwt} : {jwt: string}) => {
        try{
            const { data } = await api.delete(`/api/cart/delete-many`, {
                headers: { Authorization: `Bearer ${jwt}` },
            })

            if (data?.error) {
                await handleJWTError(data.error.name, {
                    repeatRequestMethodName: 'deleteAllFromCartFx',
                })
            }
        } catch (error) {
            toast.error((error as Error).message)
        }
    }
)