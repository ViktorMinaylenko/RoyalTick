'use client'

import { IUser } from '@/types/user'
import api from '@/api/apiInstance'
import { createDomain, createEffect } from 'effector'
import toast from 'react-hot-toast'
import { handleJWTError } from '@/lib/utils/errors'
import { setIsAuth } from '../auth'

export const user = createDomain()

export const loginCheck = user.createEvent<{ jwt: string }>()

export const loginCheckFx = createEffect(async ({ jwt }: { jwt: string }) => {
  try {
    const { data } = await api.get('/api/users/login-check', {
      headers: { Authorization: `Bearer ${jwt}` },
    })

    if (data?.error) {
      handleJWTError(data.error.name, {
        repeatRequestMethodName: 'loginCheck',
      })
      return {} as IUser
    }

    setIsAuth(true)
    return data
  } catch (error) {
    toast.error((error as Error).message)
    return {} as IUser
  }
})

export const refreshToken = createEffect(async ({ jwt }: { jwt: string }) => {
  const { data } = await api.post('/api/users/refresh', { jwt })

  localStorage.setItem('auth', JSON.stringify(data))

  return data
})

