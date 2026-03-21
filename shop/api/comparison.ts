import { IAddItemToComparisonFx, IComparisonItem } from "@/types/comparison"
import { createEffect } from "effector"
import api from './apiInstance'
import { handleJWTError } from "@/lib/utils/errors"
import toast from "react-hot-toast"

export const addItemToComparisonFx = createEffect(
  async ({ jwt, setSpinner, ...payload }: IAddItemToComparisonFx) => {
    try {
      setSpinner(true)
      const { data } = await api.post(`/api/comparison/add`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })

      if (data?.error) {
        const newData: { newComparisonItem: IComparisonItem } = await handleJWTError(data.error.name, {
          repeatRequestMethodName: 'addItemToComparisonFx',
          payload: { ...payload, setSpinner },
        })
        return newData
      }

      toast.success('Додано в порівняння!')
      return data
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSpinner(false)
    }
  }
)

export const getComparisonItemsFx = createEffect(
  async ({ jwt }: { jwt: string }) => {
    try {
      const { data } = await api.post(`/api/comparison/all`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })

      if (data?.error) {
        const newData: IComparisonItem[] = await handleJWTError(
          data.error.name,
          {
            repeatRequestMethodName: 'getComparisonItemsFx',
          })
        return newData
      }

      return data
    } catch (error) {
      toast.error((error as Error).message)
    }
  }
)