import { signInFx, signUpFx } from '@/api/auth'
import { ISignUpFx } from '@/types/authPopup'
import { createDomain, sample } from 'effector'
import toast from 'react-hot-toast'

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