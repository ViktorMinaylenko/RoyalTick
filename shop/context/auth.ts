import { onAuthSuccess } from '@/lib/utils/auth'
import { ISignUpFx } from '@/types/authPopup'
import { createDomain, createEffect, sample } from 'effector'
import toast from 'react-hot-toast'
import api from '../api/apiInstance'

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


const auth = createDomain()

export const openAuthPopup = auth.createEvent()
export const closeAuthPopup = auth.createEvent()
export const handleSignUp = auth.createEvent<ISignUpFx>()
export const handleSignIn = auth.createEvent<ISignUpFx>()
export const setIsAuth = auth.createEvent<boolean>()

export const $openAuthPopup = auth
  .createStore<boolean>(false)
  .on(openAuthPopup, () => true)
  .on(closeAuthPopup, () => false)

export const $isAuth = auth
  .createStore(false)
  .on(setIsAuth, (_, isAuth) => isAuth)

export const $auth = auth
  .createStore({})
  .on(signUpFx.done, (_, { result }) => result)
  .on(signUpFx.fail, (_, { error }) => {
    toast.error(error.message)
  })
  .on(signInFx.done, (_, { result }) => result)
  .on(signInFx.fail, (_, { error }) => {
    toast.error(error.message)
  })

sample({
  clock: handleSignUp,
  source: $auth,
  fn: (_, { name, email, password, isOAuth, image }) => ({
    name,
    password,
    email,
    isOAuth,
    image,
  }),
  target: signUpFx,
})

sample({
  clock: handleSignIn,
  source: $auth,
  fn: (_, { email, password, isOAuth, name, image }) => ({
    email,
    password,
    isOAuth,
    name,
    image,
  }),
  target: signInFx,
})