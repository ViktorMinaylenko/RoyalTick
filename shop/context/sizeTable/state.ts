'use client'

import { ISelectedSizes } from "@/types/common"
import { sizeTable, setSizeTableSizes } from "."

export const $sizeTableSizes = sizeTable
    .createStore({} as ISelectedSizes)
    .on(setSizeTableSizes, (_, sizes) => sizes)