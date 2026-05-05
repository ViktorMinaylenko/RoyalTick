'use client'

import { AllowedLangs } from "@/constants/lang"
import { createDomain } from "effector"

export const lang = createDomain()

export const setLang = lang.createEvent<AllowedLangs>()