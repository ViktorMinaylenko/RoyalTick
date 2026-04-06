import { ICatalogCategoryOptions, ISizeOption } from "@/types/catalog";
import { createDomain } from "effector";

const catalog = createDomain()

export const setCatalogCategoryOptions = catalog.createEvent<Partial<ICatalogCategoryOptions>>()
export const setSizesOptions = catalog.createEvent<ISizeOption[]>()
export const setSizesOptionByCheck = catalog.createEvent<string>()
export const updateSizesOptionBySize = catalog.createEvent<string>()
export const setSizes = catalog.createEvent<string[]>()

export const $catalogCategoryOptions = catalog.createStore<ICatalogCategoryOptions>({})
    .on(setCatalogCategoryOptions, (_, options) => ({ ...options }))

export const $sizesOptions = catalog.createStore<ISizeOption[]>([])
    .on(setSizesOptions, (_, options) => options)
    .on(setSizesOptionByCheck, (state, size) => state.map((item) =>
        item.size === size ? { ...item, checked: !item.checked } : item
    ))
    .on(updateSizesOptionBySize, (state, size) => state.map((item) =>
        item.size === size ? { ...item, checked: true } : item
    ))

export const $sizes = catalog.createStore<string[]>([])
    .on(setSizes, (_, sizes) => sizes)