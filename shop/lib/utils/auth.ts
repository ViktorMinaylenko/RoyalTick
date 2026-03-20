import toast from 'react-hot-toast'
import { handlecloseAuthModal } from './common'
import { setIsAuth } from '@/context/auth'

export const onAuthSuccess = <T>(message: string, data: T) => {
  localStorage.setItem('auth', JSON.stringify(data))
  toast.success(message)
  handlecloseAuthModal()
  setIsAuth(true)
}

export const nameValidationRules = (
  message: string,
  requireMessage?: string
) => ({
  ...(requireMessage && { required: requireMessage }),
  pattern: {
    value: /^[а-яА-Яa-zA-ZёЁ]*$/,
    message,
  },
  minLength: 2,
  maxLength: 15,
})

export const emailValidationRules = (
  message: string,
  requireMessage?: string
) => ({
  ...(requireMessage && { required: requireMessage }),
  pattern: {
    value: /\S+@\S+\.\S+/,
    message,
  },
})
