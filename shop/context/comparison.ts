'use client'

import { handleJWTError } from "@/lib/utils/errors"
import api from '../api/apiInstance'
import { IAddItemsFromLSToComparisonFx, IAddItemToComparisonFx, IComparisonItem, IDeleteComparisonItemsFx } from "@/types/comparison"
import { createDomain, createEffect, sample } from "effector"
import toast from "react-hot-toast"

export const addItemToComparisonFx = createEffect(
    async ({ jwt, setSpinner, ...payload }: IAddItemToComparisonFx) => {
        try {
            setSpinner(true)
            const { data } = await api.post(`/api/comparison/add`, payload, {
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
            return { newComparisonItem: {} as IComparisonItem }
        } finally {
            setSpinner(false)
        }
    }
)

export const getComparisonItemsFx = createEffect(
    async ({ jwt }: { jwt: string }) => {
        try {
            const { data } = await api.get(`/api/comparison/all`, {
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
            return []
        }
    }
)

export const addItemsFromLSToComparisonFx = createEffect(
    async ({ jwt, comparisonItems }: IAddItemsFromLSToComparisonFx) => {
        try {
            const { data } = await api.post(
                '/api/comparison/add-many',
                { items: comparisonItems },
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            )

            if (data?.error) {
                const newData: IComparisonItem[] = await handleJWTError(
                    data.error.name,
                    {
                        repeatRequestMethodName: 'addItemsFromLSToComparisonFx',
                        payload: { items: comparisonItems },
                    })
                return newData
            }

            loadComparisonItems({ jwt })
            return data
        } catch (error) {
            toast.error((error as Error).message)
            return []
        }
    }
)

export const deleteComparisonItemFx = createEffect(
    async ({ jwt, id, setSpinner }: IDeleteComparisonItemsFx) => {
        try {
            setSpinner(true)
            const { data } = await api.delete(`/api/comparison/delete?id=${id}`, {
                headers: { Authorization: `Bearer ${jwt}` },
            })

            if (data?.error) {
                const newData: { id: string } = await handleJWTError(data.error.name, {
                    repeatRequestMethodName: 'deleteComparisonItemFx',
                    payload: { id, setSpinner },
                })
                return newData
            }

            toast.success('Видалено з порівняння!')
            return data
        } catch (error) {
            toast.error((error as Error).message)
            return { id: '' }
        } finally {
            setSpinner(false)
        }
    }
)

export const comparison = createDomain()

export const loadComparisonItems = comparison.createEvent<{ jwt: string }>()
export const addItemToComparison =
    comparison.createEvent<IAddItemToComparisonFx>()
export const setComparisonFromLS = comparison.createEvent<IComparisonItem[]>()
export const setShouldShowEmptyComparison = comparison.createEvent<boolean>()
export const addItemsFromLSToComparison =
    comparison.createEvent<IAddItemsFromLSToComparisonFx>()
export const deleteItemFromComparison = comparison.createEvent<IDeleteComparisonItemsFx>()

export const $comparison = comparison
    .createStore<IComparisonItem[]>([])
    .on(getComparisonItemsFx.done, (_, { result }) => result)
    .on(addItemToComparisonFx.done, (state, { result }) => [
        ...state,
        result.newComparisonItem,
    ])
    .on(addItemsFromLSToComparisonFx.done, (_, { result }) => result.items)
    .on(deleteComparisonItemFx.done, (state, { result }) =>
        state.filter((item) => item._id !== result.id)
    )

export const $comparisonFromLs = comparison
    .createStore<IComparisonItem[]>([])
    .on(setComparisonFromLS, (_, comparison) => comparison)

export const $shouldShowEmptyComparison = comparison
    .createStore(false)
    .on(setShouldShowEmptyComparison, (_, value) => value)

sample({
    clock: loadComparisonItems,
    source: $comparison,
    fn: (_, data) => data,
    target: getComparisonItemsFx,
})

sample({
    clock: addItemToComparison,
    source: $comparison,
    fn: (_, data) => data,
    target: addItemToComparisonFx,
})

sample({
    clock: addItemsFromLSToComparison,
    source: $comparison,
    fn: (_, data) => data,
    target: addItemsFromLSToComparisonFx,
})

sample({
    clock: deleteItemFromComparison,
    source: $comparison,
    fn: (_, data) => data,
    target: deleteComparisonItemFx,
})