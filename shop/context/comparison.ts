'use client'

import { addItemToComparisonFx, getComparisonItemsFx } from "@/api/comparison"
import { IAddItemToComparisonFx, IComparisonItem } from "@/types/comparison"
import { createDomain, sample } from "effector"


export const comparison = createDomain()

export const loadComparisonItems = comparison.createEvent<{ jwt: string }>()
export const addItemToComparison =
    comparison.createEvent<IAddItemToComparisonFx>()
export const setComparisonFromLS = comparison.createEvent<IComparisonItem[]>()
export const setShouldShowEmptyComparison = comparison.createEvent<boolean>()

export const $comparison = comparison
    .createStore<IComparisonItem[]>([])
    .on(getComparisonItemsFx.done, (_, { result }) => result)
    .on(addItemToComparisonFx.done, (state, { result }) => [
        ...state,
        result.newComparisonItem,
    ])

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