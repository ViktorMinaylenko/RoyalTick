'use client'
import { createDomain, createEffect } from "effector";
import api from '@/api/apiInstance'
import { toast } from "react-hot-toast";
import { IGetRoyalTickOfficesByCityFx, IMakePaymentFx, IOrderDetailsValues, IPaymentNotifyFx, IRoyalTickAddressData } from "@/types/order";
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
export const makePayment = order.createEvent<IMakePaymentFx>()
export const setOrderDetailsValues = order.createEvent<IOrderDetailsValues>()

export const setNovaPoshtaTab = order.createEvent<boolean>()
export const setShouldLoadNovaPoshtaData = order.createEvent<boolean>()
export const setChosenNovaPoshtaAddressData = order.createEvent<Partial<IRoyalTickAddressData>>()
export const getNovaPoshtaOfficesByCity = order.createEvent<{ city: string }>()

export const getNovaPoshtaOfficesByCityFx = createEffect(
    async ({ city }: { city: string }) => {
        const { data } = await api.post('/api/nova-poshta', { city })
        return data.warehouses as IRoyalTickAddressData[]
    }
)

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
    async ({ jwt, amount, description, orderDetails, cartItems }: IMakePaymentFx) => {
        try {
            const { data } = await api.post(
                '/api/payment',
                { amount, description, orderDetails, cartItems },
                { headers: { Authorization: `Bearer ${jwt}` } }
            )

            if (data?.result) {
                localStorage.setItem('orderReference', JSON.stringify(data.result.orderReference))
                localStorage.setItem('paymentAmount', JSON.stringify(data.result.amount))
                localStorage.setItem('orderDescription', description)
                localStorage.setItem('orderDetails', JSON.stringify(orderDetails))
                localStorage.setItem('orderCart', JSON.stringify(cartItems))

                const form = document.createElement('form')
                form.method = 'POST'
                form.action = 'https://secure.wayforpay.com/pay'
                form.acceptCharset = 'utf-8'

                Object.entries(data.result).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((v) => {
                            const input = document.createElement('input')
                            input.type = 'hidden'
                            input.name = key
                            input.value = String(v)
                            form.appendChild(input)
                        })
                    } else {
                        const input = document.createElement('input')
                        input.type = 'hidden'
                        input.name = key
                        input.value = String(value)
                        form.appendChild(input)
                    }
                })

                document.body.appendChild(form)
                form.submit()
            }

            return data.result
        } catch (error) {
            toast.error((error as Error).message)
        }
    }
)

export const checkPaymentFx = order.createEffect(
    async ({ orderReference }: { orderReference: string }) => {
        try {
            const { data } = await api.post(
                '/api/payment/check',
                { orderReference },
            )

            return data.result
        } catch (error) {
            toast.error((error as Error).message)
        }
    }
)

export const paymentNotifyFx = order.createEffect(
    async ({ email, orderReference, amount, description, orderDetails, cartItems }: IPaymentNotifyFx) => {
        try {
            const { data } = await api.post(
                '/api/payment/notify',
                { email, orderReference, amount, description, orderDetails, cartItems },
            )
            return data
        } catch (error) {
            toast.error((error as Error).message)
        }
    }
)