'use client'
import { useUnit } from 'effector-react'
import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { $user } from '@/context/user/state'

export const useUserAvatar = () => {
  const user = useUnit($user)
  const [src, setSrc] = useState('')

  useEffect(() => {
    if (user.image) {
      setSrc(user.image)
      return
    }

    const firebaseUser = auth.currentUser
    if (firebaseUser?.photoURL) {
      setSrc(firebaseUser.photoURL)
      return
    }

    setSrc('')
  }, [user.image, user._id])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (!user.image && firebaseUser?.photoURL) {
        setSrc(firebaseUser.photoURL)
      }
    })
    return () => unsubscribe()
  }, [user.image])

  return { src, alt: user.name || 'User avatar' }
}
