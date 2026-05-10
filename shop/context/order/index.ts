'use client'
import { createDomain, createEffect } from "effector";
import api from '@/api/apiInstance'
import { toast } from "react-hot-toast";
import { IGetRoyalTickOfficesByCityFx, IRoyalTickAddressData } from "@/types/order";
import { royalTickStores } from "@/constants/royaltick-stores";

export const order = createDomain()
export const setPickupTab = order.createEvent<boolean>()
export const setCourierTab = order.createEvent<boolean>()
export const setMapInstance = order.createEvent<any>()
export const setShouldLoadRoyalTickData = order.createEvent<boolean>()
export const setChosenPickupAddressData = order.createEvent<Partial<IRoyalTickAddressData>>()
export const getRoyalTickOfficesByCity = order.createEvent<IGetRoyalTickOfficesByCityFx>()
export const setChosenCourierAddressData = order.createEvent<Partial<IRoyalTickAddressData>>()
export const setShouldShowCourierAddressData = order.createEvent<boolean>()
export const setCourierAddressData = order.createEvent<IRoyalTickAddressData>()
export const setOnlinePaymentTb = order.createEvent<boolean>()
export const setCashPaymentTb = order.createEvent<boolean>()
export const setScrollToRequiredBlock = order.createEvent<boolean>()

export const getRoyalTickOfficesByCityFx = createEffect(
    async ({ city }: { city: string; lang: string }) => {
        const cityLower = city.toLowerCase()

        const filtered = royalTickStores.filter((store) =>
            cityLower.includes(store.city.toLowerCase())
        )

        return filtered
    }
)