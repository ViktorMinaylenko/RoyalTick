import { closeAuthPopup, openAuthPopup, setIsAuth } from '@/context/auth'
import { setCurrentProduct } from '@/context/goods'
import {
  closeSearchModal,
  closeSizeTable,
  showSizeTable,
} from '@/context/modals'
import { setSizeTableSizes } from '@/context/sizeTable'
import { loginCheck } from '@/context/user'
import { ICartItem } from '@/types/cart'
import { IProduct } from '@/types/common'
import { EventCallable } from 'effector'
import toast from 'react-hot-toast'

export const removeOverflowHiddenFromBody = () => {
  const body = document.querySelector('body') as HTMLBodyElement
  body.classList.remove('overflow-hidden')
}

export const addOverflowHiddenToBody = (paddingRight = '') => {
  const body = document.querySelector('body') as HTMLBodyElement
  body.classList.add('overflow-hidden')
  paddingRight && (body.style.paddingRight = paddingRight)
}

export const getWindowWidth = () => {
  const { innerWidth: windowWidth } =
    typeof window !== 'undefined' ? window : { innerWidth: 0 }
  return { windowWidth }
}

export const handleCloseSearchModal = () => {
  closeSearchModal()
  removeOverflowHiddenFromBody()
}

export const shuffle = <T>(array: T[]) => {
  let currentIndex = array.length,
    randomIndex

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--
      ;[array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ]
  }

  return array
}

export const formatPrice = (x: number) =>
  x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

export const idGenerator = () => {
  const S4 = () =>
    (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  return (
    S4() +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    '-' +
    S4() +
    S4() +
    S4()
  )
}

export const closeSizeTableByCheck = (openQuickViewModal: boolean) => {
  if (!openQuickViewModal) {
    removeOverflowHiddenFromBody()
  }

  closeSizeTable()
}

export const handleopenAuthModal = () => {
  removeOverflowHiddenFromBody()
  openAuthPopup()
}

export const handlecloseAuthModal = () => {
  removeOverflowHiddenFromBody()
  closeAuthPopup()
}

export const closeAuthModalWhenSomeModalOpened = (
  openQuickViewModal: boolean,
  showSizeTable: boolean
) => {
  if (openQuickViewModal || showSizeTable) {
    closeAuthPopup()
    return
  }

  handlecloseAuthModal()
}

export const isUserAuth = () => {

  if (typeof window === 'undefined') return false

  const auth = JSON.parse(localStorage.getItem('auth') as string)

  if (!auth?.accessToken) {
    setIsAuth(false)
    return false
  }

  return true
}

export const triggerLoginCheck = () => {
  if (!isUserAuth()) {
    return
  }

  const auth = JSON.parse(localStorage.getItem('auth') as string)

  loginCheck({ jwt: auth.accessToken })
}

export const isItemInList = (array: ICartItem[], productId: string) =>
  array.some((item) => String(item.productId) === String(productId))

export const handleShowSizeTable = (product: IProduct) => {
  setCurrentProduct(product)

  const sizesData =
    product.category === 'straps'
      ? {
        width: Number(product.characteristics.width),
        length: Number(product.characteristics.length),
      }
      : {
        caseSize: Number(product.characteristics.caseSize),
      }

  setSizeTableSizes({
    sizes: sizesData as any,
    type: product.category,
  })

  addOverflowHiddenToBody()
  showSizeTable()
}

export const getCartItemCountBySize = (
  cartItems: ICartItem[],
  currentSize: string
) => {
  const foundItem = cartItems.find((item) => {
    if (!item.size || !currentSize) return false

    const itemSize = String(item.size)
      .toLowerCase()
      .replace(/\s/g, '')
      .replace('mm', '')
    const targetSize = String(currentSize)
      .toLowerCase()
      .replace(/\s/g, '')
      .replace('mm', '')


    return itemSize === targetSize
  })

  return foundItem ? Number(foundItem.count) : 0
}

export const deleteProductFromLS = <T>(
  id: string,
  key: string,
  event: EventCallable<T>,
  setShouldShowEmpty: (arg0: boolean) => void,
  message: string,
  withToast = true
) => {
  let items = JSON.parse(localStorage.getItem(key) as string)

  if (!items) {
    items = []
  }

  const updatedItems = items.filter(
    (item: { clientId: string }) => item.clientId !== id
  )

  localStorage.setItem(key, JSON.stringify(updatedItems))
  event(updatedItems)
  withToast && toast.success(message)

  if (!updatedItems.length) {
    setShouldShowEmpty(true)
  }
}

export const showCountMessage = (count: string, lang: string) => {
  if (count == '11' || count == '12' || count == '13' || count == '14') {
    return lang === 'ua' ? 'товарів' : 'items'
  }

  if (count.endsWith('1')) {
    return lang === 'ua' ? 'товар' : 'item'
  }

  if (count.endsWith('2') || count.endsWith('3') || count.endsWith('4')) {
    return lang === 'ua' ? 'товара' : 'items'
  }

  return lang === 'ua' ? 'товарів' : 'items'
}

export const checkOffsetParam = (offset: string | string[] | undefined) => {
  if (typeof offset === 'undefined' || offset === null) return false

  const num = Number(offset)

  return !isNaN(num) && isFinite(num) && num >= 0
}

export const getSearchParamsUrl = () => {
  const paramsString = window.location.search
  const urlParams = new URLSearchParams(paramsString)

  return urlParams
}

export const updateSearchParam = (
  key: string,
  value: string | number,
  pathname: string
) => {
  const urlParams = getSearchParamsUrl()
  urlParams.set(key, `${value}`)
  const newUrl = `${pathname}?${urlParams.toString()}`
  window.history.pushState({path: newUrl}, '', newUrl)
}

export const checkPriceParam = (price: number) => price && !isNaN(price) &&  price >= 0 && price <= 100000
