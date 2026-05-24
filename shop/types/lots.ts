export interface IBid {
    userId: string
    userName: string
    amount: number
    createdAt: string
}

export interface ILot {
    _id: string
    title: string
    description: string
    category: string
    subcategory: string
    condition: string
    saleType: string
    startPrice: number
    currentPrice: number
    bidStep: number
    reservePrice: number | null
    buyNowPrice: number | null
    startDate: string
    endDate: string
    autoExtend: boolean
    location: string
    deliveryMethods: string[]
    deliveryPayer: string
    returnsAllowed: boolean
    guarantees: string
    buyerComment: string
    mainPhotoUrl: string
    additionalPhotoUrls: string[]
    videoUrl: string
    userId: string
    userName: string
    userEmail: string
    createdAt: string
    status: string
    bids: IBid[]
}

export interface IProfileLotsSliderProps {
    title: string
    lots: IUserLot[]
    spinner: boolean
    allLink: string
    emptyText: string
}


export interface IMessage {
    _id: string
    senderId: string
    senderName: string
    text: string
    createdAt: string
    isRead: boolean
}

export interface IChat {
    _id: string
    lotId: string
    lotTitle: string
    lotPhoto: string
    winnerId: string
    winnerName: string
    ownerId: string
    ownerName: string
    messages: IMessage[]
    createdAt: string
    status: string
    dealCompletedByOwner: boolean
    dealCompletedByWinner: boolean
    ownerRatedBuyer: boolean
    winnerRatedSeller: boolean
}

export interface IUserLot {
    _id: string
    title: string
    mainPhotoUrl: string
    currentPrice: number
    endDate: string
    status: string
    bids: unknown[]
}

export interface ILotForm {
    title: string
    category: string
    subcategory: string
    description: string
    condition: string
    saleType: string
    startPrice: string
    bidStep: string
    reservePrice: string
    buyNowPrice: string
    startDate: string
    endDate: string
    autoExtend: boolean
    location: string
    deliveryMethods: string[]
    deliveryPayer: string
    returnsAllowed: boolean
    guarantees: string
    buyerComment: string
    moderatorNote: string
    confirmRules: boolean
    videoUrl: string
}

export const initialForm: ILotForm = {
    title: '',
    category: '',
    subcategory: '',
    description: '',
    condition: '',
    saleType: 'auction',
    startPrice: '',
    bidStep: '',
    reservePrice: '',
    buyNowPrice: '',
    startDate: '',
    endDate: '',
    autoExtend: false,
    location: '',
    deliveryMethods: [],
    deliveryPayer: 'buyer',
    returnsAllowed: false,
    guarantees: '',
    buyerComment: '',
    moderatorNote: '',
    confirmRules: false,
    videoUrl: '',
}