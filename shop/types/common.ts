import { StoreWritable } from "effector"

export interface IProduct {
  _id: string
  type: string
  category: string
  collection: string
  price: number
  name: string
  description: string
  characteristics: {
    [key: string]: string | number | boolean | string[] | number[]
  }
  images: string[]
  vendorCode: string
  inStock: number
  isBestseller: boolean
  isNew: boolean
  popularity: number
  sizes: ISizes
  errorMessage?: string
}

export interface ISizes {
  [key: string]: boolean
}

export interface ISelectedSizes {
  sizes: ISizes
  type: string
  className?: string
}

export interface IBaseEffectProps{
  jwt: string
  id: string
  setSpinner: (arg0: boolean) => void
}

export interface IGetGeolocationFx {
  lat: number
  lon: number
}

export type UseGoodsByAuth<T> = StoreWritable<T>

