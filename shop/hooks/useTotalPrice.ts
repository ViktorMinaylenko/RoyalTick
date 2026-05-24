'use client'
import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { $cart, $cartFromLs, $totalPrice } from '@/context/cart/state'
import { setTotalPrice } from '@/context/cart/index'
import { usePriceAnimation } from './usePriceAnimation'
import { useGoodsByAuth } from './useGoodsByAuth'

export const useTotalPrice = () => {
  const totalPrice = useUnit($totalPrice)
  const currentCartByAuth = useGoodsByAuth($cart, $cartFromLs)

  const getNewTotal = () =>
    currentCartByAuth
      .map((item) => +item.price * +item.count)
      .reduce((defaultCount, item) => defaultCount + item, 0)

  const {
    value: animatedPrice,
    setFrom,
    setTo,
  } = usePriceAnimation(totalPrice, getNewTotal())

  useEffect(() => {
    setTotalPrice(getNewTotal())
    setFrom(totalPrice)
    setTo(getNewTotal())
  }, [currentCartByAuth])

  return { animatedPrice }
}
