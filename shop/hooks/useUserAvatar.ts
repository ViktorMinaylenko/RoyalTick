'use client'
import { useUnit } from 'effector-react'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { $user } from '@/context/user/state'

export const useUserAvatar = () => {
  const user = useUnit($user)
  const [src, setSrc] = useState('')

  useEffect(() => {
    // 1. Пріоритет: зображення з твоєї бази даних (MongoDB)
    if (user.image) {
      setSrc(user.image)
      return
    }

    // 2. Якщо в БД порожньо, беремо фото з провайдера (Google/GitHub тощо) через Firebase
    const firebaseUser = auth.currentUser
    if (firebaseUser?.photoURL) {
      setSrc(firebaseUser.photoURL)
      return
    }

    // 3. Якщо фото ніде немає, можна поставити порожній рядок або дефолтну іконку
    setSrc('')
  }, [user.image])

  return { src, alt: user.name || 'User avatar' }
}
