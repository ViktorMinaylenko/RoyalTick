
import { sample } from "effector"
import { fetchCart, addProductToCart, addProductsFromLSToCart, addProductsFromLSToCartFx, updateCartItemQuantity, deleteProductFromCart, addProductToCartFx, getCartItemsFx, removeCartItemFx, updateCartItemQuantityFx, deleteAllFromCart, deleteAllFromCartFx } from "."
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

sample({
    clock: deleteAllFromCart,
    source: {},
    fn: (_, data) => data,
    target: deleteAllFromCartFx,
})