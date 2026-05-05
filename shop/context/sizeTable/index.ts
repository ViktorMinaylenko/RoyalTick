'use client'

import { ISelectedSizes } from "@/types/common"
import { createDomain } from "effector"

export const sizeTable = createDomain()

export const setSizeTableSizes = sizeTable.createEvent<ISelectedSizes>()