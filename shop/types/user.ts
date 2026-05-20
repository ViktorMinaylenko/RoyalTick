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