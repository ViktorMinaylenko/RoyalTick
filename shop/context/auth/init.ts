import { sample } from "effector"
import { handleSignUp, signUpFx, handleSignIn, signInFx } from "."
import { $auth } from "./state"

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