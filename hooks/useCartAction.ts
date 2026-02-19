import { $currentProduct } from '@/context/goods'
import { useUnit } from 'effector-react'
import { useState, useEffect, useMemo } from 'react'
import { useCartByAuth } from './useCartByAuth'
import { isUserAuth } from '@/lib/utils/common'
import {
  addCartItemToLS,
  addItemToCart,
  addProductToCartBySizeTable,
} from '@/lib/utils/cart'
import { updateCartItemCount } from '@/context/cart'

export const useCartAction = (isSizeTable = false) => {
  const product = useUnit($currentProduct)
  const [selectedSize, setSelectedSize] = useState('')
  const currentCartByAuth = useCartByAuth()
  const currentCartItems = currentCartByAuth.filter(
    (item) => String(item.productId) === String(product._id)
  )
  const cartItemBySize = currentCartItems.find((item) => {
    if (!item.size && !selectedSize) return true
    return String(item.size).trim() === String(selectedSize).trim()
  })
  const existingItem = currentCartByAuth.find(
    (item) => item.productId === product._id && item.size === selectedSize
  )
  const [addToCartSpinner, setAddToCartSpinner] = useState(false)
  const [updateCountSpinner, setUpdateCountSpinner] = useState(false)
  const [count, setCount] = useState(+(existingItem?.count as string) || 1)

  useEffect(() => {
    if (product.characteristics) {
      if (product.category === 'straps') {
        setSelectedSize(
          `${product.characteristics.width} / ${product.characteristics.length}`
        )
      } else {
        setSelectedSize(`${product.characteristics.caseSize}`)
      }
    }
  }, [product])

  const handleAddToCart = (countFromCounter?: number) => {
    if (existingItem) {
      if (!isUserAuth()) {
        addCartItemToLS(product, selectedSize, countFromCounter || 1)
        return
      }

      const auth = JSON.parse(localStorage.getItem('auth') as string)
      const updatedCountWithSize = !!countFromCounter
        ? +existingItem.count !== countFromCounter
          ? countFromCounter
          : +existingItem.count + 1
        : +existingItem.count + 1

      updateCartItemCount({
        jwt: auth.accessToken,
        id: existingItem._id as string,
        setSpinner: setUpdateCountSpinner,
        count: selectedSize.length
          ? updatedCountWithSize
          : +existingItem.count + 1,
      })

      addCartItemToLS(product, selectedSize, countFromCounter || 1)
      return
    }
    if (isSizeTable) {
      addItemToCart(
        product,
        setAddToCartSpinner,
        countFromCounter || 1,
        selectedSize
      )
      return
    }

    addProductToCartBySizeTable(
      product,
      setAddToCartSpinner,
      countFromCounter || 1,
      selectedSize
    )
  }

  const allCurrentCartItemCount = useMemo(
    () => currentCartItems.reduce((a, { count }) => a + +count, 0),
    [currentCartItems]
  )

  return {
    currentCartItems,
    cartItemBySize,
    product,
    setSelectedSize,
    selectedSize,
    addToCartSpinner,
    setCount,
    count,
    existingItem,
    currentCartByAuth,
    setAddToCartSpinner,
    handleAddToCart,
    updateCountSpinner,
    allCurrentCartItemCount,
  }
}
