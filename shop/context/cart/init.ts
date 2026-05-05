
import { sample } from "effector"
import { fetchCart, addProductToCart, addProductsFromLSToCart, addProductsFromLSToCartFx, updateCartItemQuantity, deleteProductFromCart, addProductToCartFx, getCartItemsFx, removeCartItemFx, updateCartItemQuantityFx } from "."
import { $cart } from "./state"

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