import { ICartItem } from './cart'

export interface ILoadOneProductFx {
  productId: string
  category: string
}

export interface IProductSizesItemProps {
  currentSize: string | number
  selectedSize: string
  setSelectedSize: (size: string) => void
  currentCartItems: ICartItem[]
  isInStock: boolean
}

export interface IProductCounterProps {
  className: string
  count: number
  setCount: (arg0: number) => void
  cartItem: ICartItem
  updateCountAsync: boolean
  initialCount?: number
  totalCount?: number
  increasePrice?: VoidFunction
  decreasePrice?: VoidFunction
}

export interface IAddToCartBtnProps {
  handleAddToCart: VoidFunction
  addToCartSpinner: boolean
  text: string
  btnDisabled?: boolean
  className?: string
}

export interface IProductCountBySizeProps {
  products: ICartItem[]
  size: string
  withCartIcon?: boolean
}