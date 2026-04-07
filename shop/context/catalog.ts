import { ICatalogCategoryOptions, IColorOption, ISizeOption } from "@/types/catalog";
import { createDomain } from "effector";

const catalog = createDomain()

export const setCatalogCategoryOptions = catalog.createEvent<Partial<ICatalogCategoryOptions>>()
export const setSizesOptions = catalog.createEvent<ISizeOption[]>()
export const setSizesOptionByCheck = catalog.createEvent<string>()
export const updateSizesOptionBySize = catalog.createEvent<string>()
export const setSizes = catalog.createEvent<string[]>()
export const setColorsOptions = catalog.createEvent<IColorOption[]>()
export const updateColorsOptionByCode = catalog.createEvent<string>()
export const setColors = catalog.createEvent<string[]>()

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

export const $colorsOptions = catalog
    .createStore<IColorOption[]>([
        { id: 1, colorCode: 'black', checked: false, colorText: 'Black' },
        { id: 2, colorCode: 'white', checked: false, colorText: 'White' },
        { id: 3, colorCode: 'navy', checked: false, colorText: 'Navy' },
        { id: 4, colorCode: 'brown', checked: false, colorText: 'Brown' },
        { id: 5, colorCode: 'cherry', checked: false, colorText: 'Cherry' },
        { id: 6, colorCode: 'carbon', checked: false, colorText: 'Carbon' },
        { id: 7, colorCode: 'dark-brown', checked: false, colorText: 'Dark Brown' },
        { id: 8, colorCode: 'bordeaux', checked: false, colorText: 'Bordeaux' },
        { id: 9, colorCode: 'green', checked: false, colorText: 'Green' },
        { id: 10, colorCode: 'grey', checked: false, colorText: 'Grey' },
        { id: 11, colorCode: 'beige', checked: false, colorText: 'Beige' },
        { id: 12, colorCode: 'blue', checked: false, colorText: 'Blue' },
        { id: 13, colorCode: 'silver', checked: false, colorText: 'Silver' },
    ])
    .on(setColorsOptions, (_, options) => options)
    .on(updateColorsOptionByCode, (state, color) =>
        state.map((item) =>
            item.colorCode.toLowerCase() === color.toLowerCase()
                ? { ...item, checked: true }
                : item
        )
    )

export const $sizes = catalog.createStore<string[]>([])
    .on(setSizes, (_, sizes) => sizes)

export const $colors = catalog.createStore<string[]>([])
    .on(setColors, (_, colors) => colors)