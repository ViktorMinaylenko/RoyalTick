'use client'

import { ICatalogCategoryOptions, ISizeOption, IColorOption } from "@/types/catalog"
import { createDomain } from "effector"

export const catalog = createDomain()

export const setCatalogCategoryOptions = catalog.createEvent<Partial<ICatalogCategoryOptions>>()
export const setSizesOptions = catalog.createEvent<ISizeOption[]>()
export const setSizesOptionByCheck = catalog.createEvent<string>()
export const updateSizesOptionBySize = catalog.createEvent<string>()
export const setSizes = catalog.createEvent<string[]>()
export const setColorsOptions = catalog.createEvent<IColorOption[]>()
export const updateColorsOptionByCode = catalog.createEvent<string>()
export const setColors = catalog.createEvent<string[]>()
export const setFiltersPopup = catalog.createEvent<boolean>()