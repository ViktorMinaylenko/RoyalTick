'use client'

import { IComparisonItem } from "@/types/comparison"
import {
    comparison,
    addItemToComparisonFx,
    getComparisonItemsFx,
    addItemsFromLSToComparisonFx,
    deleteComparisonItemFx,
    setComparisonFromLS,
    setShouldShowEmptyComparison,
} from '.'

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