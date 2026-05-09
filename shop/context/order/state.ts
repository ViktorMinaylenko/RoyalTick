'use state'
import { IRoyalTickAddressData } from "@/types/order";
import { order, getRoyalTickOfficesByCityFx, setPickupTab, setCourierTab, setMapInstance, setShouldLoadRoyalTickData, setChosenPickupAddressData, setChosenCourierAddressData, setShouldShowCourierAddressData, setCourierAddressData } from ".";

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