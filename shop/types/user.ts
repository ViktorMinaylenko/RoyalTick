import { IReview } from "./review"

export interface IUser {
    _id: string
    name: string
    password: string
    email: string
    image: string
    role: string
    balance: number
    sellerRating: number
    sellerRatingsCount: number
    buyerRating: number
    buyerRatingsCount: number
    sellerReviews: IReview[]
    buyerReviews: IReview[]
    followers: string[]
    following: string[]
    isBlocked: boolean
    blockReason: string | null
    isVerified?: boolean
    verifiedAt?: string | null
}

export interface IUserGeolocation{
    features: [
        {
            properties: {
                city: string
                lon: number
                lat: number
            }
            bbox: [number, number, number, number]
        }
    ]
}

export interface ILoginCheckFx {
    jwt: string
    setShouldShowContent?: (arg0: boolean) => void
}

export interface IPropsUserPageHeader {
    userData: any
    lots: any[]
    followersCount: number
    isFollowing: boolean
    followSpinner: boolean
    isOwnProfile: boolean
    isModerator: boolean
    t: any
    onFollow: () => void
    onBlock: () => void
    onShowBlockModal: () => void
    onShowReduceModal: () => void
    blockSpinner: boolean
}

export interface IPropsUserPageReviews {
    reviews: any[]
    currentUserId?: string
    lang: string
    t: any
}

export interface IPropsUserPageBlockModal {
    userName: string
    blockReason: string
    blockSpinner: boolean
    onReasonChange: (val: string) => void
    onClose: () => void
    onConfirm: () => void
}

export interface IPropsReduceModal {
    userName: string
    reduceType: 'seller' | 'buyer'
    reduceReason: string
    reducePercent: number
    reduceSpinner: boolean
    onTypeChange: (val: 'seller' | 'buyer') => void
    onReasonChange: (val: string) => void
    onPercentChange: (val: number) => void
    onClose: () => void
    onConfirm: () => void
}