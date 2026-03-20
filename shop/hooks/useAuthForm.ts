'use client'
import { useUnit } from 'effector-react'
import { useForm } from 'react-hook-form'
import {
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  FacebookAuthProvider,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Store, EventCallable } from 'effector'
import { IInputs, ISignUpFx } from '@/types/authPopup'

export const useAuthForm = (
  initialSpinner: Store<boolean>,
  isSideActive: boolean,
  event: EventCallable<ISignUpFx>
) => {
  const spinner = useUnit(initialSpinner)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<IInputs>()

  const submitSignUpWithOAuth = async (providerName: string) => {
    try {
      let provider

      // Вибираємо потрібний провайдер залежно від натиснутої кнопки
      switch (providerName) {
        case 'google':
          provider = new GoogleAuthProvider()
          break
        case 'github':
          provider = new GithubAuthProvider()
          break
        case 'twitter':
          provider = new TwitterAuthProvider()
          break
        case 'facebook':
          provider = new FacebookAuthProvider()
          break
        default:
          provider = new GoogleAuthProvider()
      }

      // 1. Відкриваємо поп-ап вибраного сервісу
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // 2. Відправляємо дані в Effector (signUpFx або signInFx)
      // ВАЖЛИВО: Передаємо isOAuth: true, щоб бекенд знав, що bcrypt не потрібен
      event({
        name: user.displayName || 'Користувач',
        email: user.email || '',
        password: user.uid,
        image: user.photoURL || '',
        isOAuth: true,
      })
    } catch (err) {
      console.error(`Помилка входу через ${providerName}:`, err)
    }
  }

  return {
    spinner,
    register,
    errors,
    handleSubmit,
    submitSignUpWithOAuth,
  }
}
