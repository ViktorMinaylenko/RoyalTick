import { ICartItem } from './cart'

export interface IOrderTitleProps {
    orderNumber: string
    text: string
}

export interface IOrderCartItemProps {
    item: ICartItem
    position: number
}

export interface IGetRoyalTickOfficesByCityFx {
    city: string
    lang: string
}

export interface IRoyalTickAddressData {
    address_line1: string
    address_line2: string
    city: string
    place_id: string
    bbox: IAddressBBox
    lat: number
    lon: number
}

export interface ITabControlsProps {
    handleTab1: VoidFunction
    handleTab2: VoidFunction
    handleTab3?: VoidFunction
    tab1Active: boolean
    tab2Active: boolean
    tab3Active?: boolean
    tab1Text: string
    tab2Text: string
    tab3Text?: string
}

export interface IAddressPosition {
    lat: number
    lon: number
}

export interface IAddressBBox {
    lon1: number
    lat1: number
    lon2: number
    lat2: number
}

export interface IPickupAddressItemProps {
    addressItem: IRoyalTickAddressData
    handleChosenAddressData: (arg0: Partial<IRoyalTickAddressData>) => void
    handleSelectAddress: (arg0: IAddressBBox, arg1: IAddressPosition) => void
}

export interface IAddressesListProps {
    listClassName: string
    handleSelectAddressByMarkers?: (
        arg0: IAddressBBox,
        arg1: IAddressPosition,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        arg2?: any
    ) => void
}

export interface IMakePaymentFx {
    amount: string
    description: string
    jwt: string
    orderDetails?: IOrderDetailsValues
    cartItems?: any[]
}

export interface IPaymentData {
    orderReference: string
    amount: number
    transactionStatus: string
    status?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
}

export interface IPaymentNotifyFx {
    email: string
    orderReference?: string
    amount?: number
    description?: string
    orderDetails?: any
    cartItems?: any[]
    message?: string
}

export interface IOrderDetailsValues{
    name_label: string
    surname_label: string
    phone_label: string
    email_label: string
    message_label: string
    isValid: boolean
}