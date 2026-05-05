import { sample } from "effector"
import { loadComparisonItems, getComparisonItemsFx, addItemToComparison, addItemToComparisonFx, addItemsFromLSToComparison, addItemsFromLSToComparisonFx, deleteItemFromComparison, deleteComparisonItemFx } from "."
import { $comparison } from "./state"

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
