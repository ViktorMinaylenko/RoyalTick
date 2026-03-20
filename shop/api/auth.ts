import { createEffect } from 'effector'
import { onAuthSuccess } from '@/lib/utils/auth'
import api from './apiInstance'
import toast from 'react-hot-toast'
import { ISignUpFx } from '@/types/authPopup'
import { setIsAuth } from '@/context/auth'
import { handleJWTError } from '@/lib/utils/errors'

export const oauthFx = createEffect(
  async ({ name, password, email, image }: ISignUpFx) => {
    try {
      const { data } = await api.post('api/users/oauth', {
        name,
        password,
        email,
        image,
      })

      await api.post('/api/users/email', {
        password,
        email,
      })

      onAuthSuccess('Авторізація виконана!', data)
      return data
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
)

export const signUpFx = createEffect(
  async ({ name, password, email, isOAuth, image }: ISignUpFx) => {
    if (isOAuth) {
      return await oauthFx({
        email,
        password,
        name,
        image,
      })
    }

    const { data } = await api.post('/api/users/signup', {
      name,
      password,
      email,
    })

    if (data.warningMessage) {
      toast.error(data.warningMessage)
      return null
    }

    onAuthSuccess('Реєстрація пройшла успішно!', data)

    return data
  }
)

export const signInFx = createEffect(
  async ({ email, password, isOAuth, image }: ISignUpFx) => {
    if (isOAuth) {
      return await oauthFx({
        email,
        password,
        image,
      })
    }
    const { data } = await api.post('/api/users/login', { email, password })

    if (data.warningMessage) {
      toast.error(data.warningMessage)
      return null
    }

    onAuthSuccess('Вхід виконано!', data)

    return data
  }
)

export const loginCheckFx = createEffect(async ({ jwt }: { jwt: string }) => {
  try {
    const { data } = await api.get('/api/users/login-check', {
      headers: { Authorization: `Bearer ${jwt}` },
    })

    if (data?.error) {
      handleJWTError(data.error.name, {
        repeatRequestMethodName: 'loginCheck',
      })
      return
    }

    setIsAuth(true)
    return data
  } catch (error) {
    toast.error((error as Error).message)
  }
})

export const refreshToken = createEffect(async ({ jwt }: { jwt: string }) => {
  const { data } = await api.post('/api/users/refresh', { jwt })

  localStorage.setItem('auth', JSON.stringify(data))

  return data
})
