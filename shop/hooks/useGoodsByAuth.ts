'use client'
import { $isAuth } from '@/context/auth/state'
import { UseGoodsByAuth } from '@/types/common'
import { useUnit } from 'effector-react'

export const useGoodsByAuth = <T>(
  storeAsync: UseGoodsByAuth<T>,
  storeSync: UseGoodsByAuth<T>
) => {
  const goods = useUnit(storeAsync)
  const isAuth = useUnit($isAuth)
  const goodsFromLs = useUnit(storeSync)
  const currentGoodsByAuth = isAuth ? goods : goodsFromLs

  return currentGoodsByAuth
}
