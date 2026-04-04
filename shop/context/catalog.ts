import { ICatalogCategoryOptions } from "@/types/catalog";
import { createDomain } from "effector";

const catalog = createDomain()

export const setCatalogCategoryOptions = catalog.createEvent<Partial<ICatalogCategoryOptions>>()

export const $catalogCategoryOptions = catalog.createStore<ICatalogCategoryOptions>({})
    .on(setCatalogCategoryOptions, (_, options) => ({ ...options }))