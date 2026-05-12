'use state'
import { IOrderDetailsValues, IRoyalTickAddressData } from "@/types/order";
import { order, getRoyalTickOfficesByCityFx, setPickupTab, setCourierTab, setMapInstance, setShouldLoadRoyalTickData, setChosenPickupAddressData, setChosenCourierAddressData, setShouldShowCourierAddressData, setCourierAddressData, setOnlinePaymentTb, setCashPaymentTb, setScrollToRequiredBlock, setNovaPoshtaTab, setShouldLoadNovaPoshtaData, getNovaPoshtaOfficesByCityFx, setChosenNovaPoshtaAddressData, setOrderDetailsValues } from ".";

export const $royalTickDataByCity = order.createStore<IRoyalTickAddressData[]>([]).on(getRoyalTickOfficesByCityFx.done, (_, { result }) => result)

export const $pickupTab = order.createStore<boolean>(true).on(setPickupTab, (_, value) => value)
export const $courierTab = order.createStore<boolean>(false).on(setCourierTab, (_, value) => value)

export const $mapInstance = order.createStore<any>({}).on(setMapInstance, (_, map) => map)

export const $shouldLoadRoyalTickData = order.createStore<boolean>(false).on(setShouldLoadRoyalTickData, (_, value) => value)

export const $chosenPickupAddressData = order.createStore<Partial<IRoyalTickAddressData>>({}).on(setChosenPickupAddressData, (_, value) => value)

export const $chosenCourierAddressData = order.createStore<Partial<IRoyalTickAddressData>>({})
    .on(setChosenCourierAddressData, (_, value) => value)

export const $shouldShowCourierAddressData = order.createStore<boolean>(false)
    .on(setShouldShowCourierAddressData, (_, value) => value)

export const $courierAddressData = order.createStore<IRoyalTickAddressData>({} as IRoyalTickAddressData)
    .on(setCourierAddressData, (_, value) => value)

export const $onlinePaymentTab = order.createStore<boolean>(true).on(setOnlinePaymentTb, (_, value) => value)
export const $cashPaymentTab = order.createStore<boolean>(false).on(setCashPaymentTb, (_, value) => value)
export const $scrollToRequiredBlock = order.createStore<boolean>(false).on(setScrollToRequiredBlock, (_, value) => value)


export const $novaPoshtaTab = order.createStore<boolean>(false)
    .on(setNovaPoshtaTab, (_, value) => value)

export const $shouldLoadNovaPoshtaData = order.createStore<boolean>(false)
    .on(setShouldLoadNovaPoshtaData, (_, value) => value)

export const $novaPoshtaDataByCity = order.createStore<IRoyalTickAddressData[]>([])
    .on(getNovaPoshtaOfficesByCityFx.done, (_, { result }) => result)

export const $chosenNovaPoshtaAddressData = order.createStore<Partial<IRoyalTickAddressData>>({})
    .on(setChosenNovaPoshtaAddressData, (_, value) => value)

export const $orderDetailsValues = order.createStore<IOrderDetailsValues>({} as IOrderDetailsValues).on(setOrderDetailsValues, (_, value) => value)