'use client'
import { createDomain, createEffect } from "effector";
import api from '@/api/apiInstance'
import { toast } from "react-hot-toast";
import { IGetRoyalTickOfficesByCityFx, IMakePaymentFx, IRoyalTickAddressData } from "@/types/order";
import { royalTickStores } from "@/constants/royaltick-stores";
import { handleJWTError } from "@/lib/utils/errors";

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
export const makePayment = order.createEvent<IMakePaymentFx>()

export const getRoyalTickOfficesByCityFx = createEffect(
    async ({ city }: { city: string; lang: string }) => {
        const cityLower = city.toLowerCase()

        const filtered = royalTickStores.filter((store) =>
            cityLower.includes(store.city.toLowerCase())
        )

        return filtered
    }
)

export const makePaymentFx = order.createEffect(
    async ({ jwt, amount, description}: IMakePaymentFx) => {
        try {
            const { data } = await api.post(
                '/api/payment',
                { amount, description},
                {
                    headers: { Authorization: `Bearer ${jwt}` },
                }
            )

            if (data?.error) {
                handleJWTError(data.error.name, {
                    repeatRequestMethodName: 'makePaymentFx',
                    payload: { amount, description },
                })
                return
            }

            // Зберігаємо дані платежу
            if (data?.result?.confirmationUrl) {
                window.location.href = data.result.confirmationUrl
            }

            return data.result
        } catch (error) {
            toast.error((error as Error).message)
        }
    }
)