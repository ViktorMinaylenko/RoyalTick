'use client'

import { IUser, IUserGeolocation } from '@/types/user'
import api from '@/api/apiInstance'
import { createDomain, createEffect } from 'effector'
import toast from 'react-hot-toast'
import { handleJWTError } from '@/lib/utils/errors'
import { setIsAuth } from '../auth'
import { IGetGeolocationFx } from '@/types/common'

export const user = createDomain()

export const loginCheck = user.createEvent<{ jwt: string }>()
export const setUserGeolocation = user.createEvent<IUserGeolocation>()

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

export const getGeolocationFx = createEffect(
  async ({ lon, lat }: IGetGeolocationFx) => {
    try {
      const data = await api.get(
        // eslint-disable-next-line max-len
        `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`
      )

      return data
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
)

export const refreshToken = createEffect(async ({ jwt }: { jwt: string }) => {
  const { data } = await api.post('/api/users/refresh', { jwt })

  localStorage.setItem('auth', JSON.stringify(data))

  return data
})

