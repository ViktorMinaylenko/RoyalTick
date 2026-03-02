'use client'
import LogoText from '@/components/elements/Logo/LogoText'
import { useLang } from '@/hooks/useLang'
import Link from 'next/dist/client/link'
import Menu from './Menu'
import { openMenu, openSearchModal } from '@/context/modals'
import {
  addOverflowHiddenToBody,
  handleCloseSearchModal,
  handleOpenAuthPopup,
  triggerLoginCheck,
} from '@/lib/utils/common'
import CartPopup from './CartPopup/CartPopup'
import HeaderProfile from './HeaderProfile'
import { useUnit } from 'effector-react'
import { $isAuth } from '@/context/auth'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { loginCheckFx } from '@/api/auth'
import { useEffect } from 'react'
import { $user } from '@/context/user'
import { useCartByAuth } from '@/hooks/useCartByAuth'
import {
  addProductsFromLSToCartFx,
  setCartFromLS,
  setShouldShowEmpty,
} from '@/context/cart'
import { setLang } from '@/context/lang'

const Header = () => {
  const isAuth = useUnit($isAuth)
  const loginCheckSpinner = useUnit(loginCheckFx.pending)
  const { lang, translations } = useLang()
  const user = useUnit($user)
  const currentCartByAuth = useCartByAuth()

  console.log(currentCartByAuth)

  const handleOpenMenu = () => {
    addOverflowHiddenToBody()
    openMenu()
  }

  const handleOpenSearchModal = () => {
    openSearchModal()
    addOverflowHiddenToBody()
  }

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem('auth') as string)
    const lang = JSON.parse(localStorage.getItem('lang') as string)
    const cart = JSON.parse(localStorage.getItem('cart') as string)

    if (lang) {
      if (lang === 'ua' || lang === 'en') {
        setLang(lang)
      }
    }

    triggerLoginCheck()

    if (auth?.accessToken) {
      return
    }

    if (cart && Array.isArray(cart)) {
      if (!cart.length) {
        setShouldShowEmpty(true)
        return
      }
      setCartFromLS(cart)
    }
  }, [])

  useEffect(() => {
    if (isAuth) {
      const auth = JSON.parse(localStorage.getItem('auth') as string)
      const cartFromLS = JSON.parse(localStorage.getItem('cart') as string)

      if (cartFromLS && Array.isArray(cartFromLS)) {
        addProductsFromLSToCartFx({
          jwt: auth.accessToken,
          cartItems: cartFromLS,
        })
      }
    }
  }, [isAuth])

  return (
    <header className='header'>
      <div className='container header__container'>
        <button className='btn-reset header__burger' onClick={handleOpenMenu}>
          {translations[lang].header.menu_btn}
        </button>
        <Menu />
        <div className='header__logo'>
          <LogoText />
        </div>
        <ul className='header__links list-reset'>
          <li className='header__link-item'>
            <button
              className='btn-reset header__links__item__btn header__links__item__btn--search'
              onClick={handleOpenSearchModal}
            />
          </li>
          <li className='header__link-item'>
            <Link
              href='/favorites'
              className='header__links__item__btn header__links__item__btn--favorites'
            ></Link>
          </li>
          <li className='header__link-item'>
            <Link
              href='/comparision'
              className='header__links__item__btn header__links__item__btn--compare'
            ></Link>
          </li>
          <li className='header__link-item'>
            <CartPopup />
          </li>
          <li className='header__link-item header__links__item--profile'>
            {isAuth ? (
              <HeaderProfile />
            ) : loginCheckSpinner ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <button
                className='btn-reset header__links__item__btn header__links__item__btn--profile'
                onClick={handleOpenAuthPopup}
              />
            )}
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
