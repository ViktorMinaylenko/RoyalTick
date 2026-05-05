'use client'

import { ICartItem } from "@/types/cart"
import { cart, addProductsFromLSToCartFx, setCartFromLS, setTotalPrice, setShouldShowEmpty, addProductToCartFx, getCartItemsFx, removeCartItemFx, updateCartItemQuantityFx } from "."

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