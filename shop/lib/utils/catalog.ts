export const getCheckedPriceFrom = (price: number) =>
    +price > 100000 ? '50000' : price

export const getCheckedPriceTo = (price: number) =>
    +price > 100000 ? '100000' : price