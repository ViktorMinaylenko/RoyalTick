import { IUser } from '@/types/user'
import api from '../api/apiInstance'
import { createDomain, createEffect, sample } from 'effector'
import { setIsAuth } from './auth'
import toast from 'react-hot-toast'
import { handleJWTError } from '@/lib/utils/errors'

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

const user = createDomain()

export const loginCheck = user.createEvent<{ jwt: string }>()

export const $user = user
  .createStore<IUser>({} as IUser)
  .on(loginCheckFx.done, (_, { result }) => result)

sample({
  clock: loginCheck,
  source: $user,
  fn: (_, { jwt }) => ({
    jwt,
  }),
  target: loginCheckFx,
})
