'use client'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { setIsAuth } from '@/context/auth/index'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export const useUserLogout = () => {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)

      localStorage.removeItem('auth')

      setIsAuth(false)

      toast.success('Ви вийшли з аккаунта')

      router.push('/')

      window.location.reload()
    } catch (error) {
      console.error('Помилка при виході:', error)
      toast.error('Не вдалося вийти з системи')
    }
  }

  return handleLogout
}
