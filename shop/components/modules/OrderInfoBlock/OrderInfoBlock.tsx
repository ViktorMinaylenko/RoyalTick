import React, { MutableRefObject, useRef, useState } from 'react'
import { IOrderInfoBlock } from '@/types/modules'
import styles from '@/styles/order-block/index.module.scss'
import { useLang } from '@/hooks/useLang'
import { useTotalPrice } from '@/hooks/useTotalPrice'
import { formatPrice, handleopenAuthModal, isUserAuth, showCountMessage } from '@/lib/utils/common'
import { countWholeCartItemsAmount } from '@/lib/utils/cart'
import Link from 'next/link'
import { $cart, $cartFromLs } from '@/context/cart/state'
import { useGoodsByAuth } from '@/hooks/useGoodsByAuth'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { $chosenCourierAddressData, $chosenNovaPoshtaAddressData, $chosenPickupAddressData, $novaPoshtaTab, $onlinePaymentTab, $orderDetailsValues, $pickupTab, $scrollToRequiredBlock } from '@/context/order/state'
import { useUnit } from 'effector-react'
import { makePayment, setScrollToRequiredBlock } from '@/context/order'

const OrderInfoBlock = ({
  isCorrectPromotionalCode,
  isOrderPage,
}: IOrderInfoBlock) => {
  const { lang, translations } = useLang()
  const currentCartByAuth = useGoodsByAuth($cart, $cartFromLs)
  const onlinePaymentTab = useUnit($onlinePaymentTab)
  const pickupTab = useUnit($pickupTab)
  const chosenCourierAddressData = useUnit($chosenCourierAddressData)
  const chosenPickupAddressData = useUnit($chosenPickupAddressData)
  const scrollToRequiredBlock = useUnit($scrollToRequiredBlock)
  const [isUserAgree, setIsUserAgree] = useState(false)
  const { animatedPrice } = useTotalPrice()
  const checkboxRef = useRef<HTMLInputElement>(null) as MutableRefObject<HTMLInputElement>
  const priceWithDiscount = isCorrectPromotionalCode
    ? formatPrice(Math.round(animatedPrice - animatedPrice * 0.3))
    : formatPrice(animatedPrice)
  const orderDetailsValues = useUnit($orderDetailsValues)


  const novaPoshtaTab = useUnit($novaPoshtaTab)
  const chosenNovaPoshtaAddressData = useUnit($chosenNovaPoshtaAddressData)

  const handleAgreementChange = () => setIsUserAgree(!isUserAgree)

  const handleTabCheckbox = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key == ' ' || e.code == 'Space') {
      e.preventDefault()
      setIsUserAgree(!checkboxRef.current.checked)
      checkboxRef.current.checked = !checkboxRef.current.checked
    }
  }

  const handleMakePayment = async () => {
    if (
      !chosenCourierAddressData.address_line1 &&
      !chosenPickupAddressData.address_line1 &&
      !chosenNovaPoshtaAddressData.address_line1
    ) {
      setScrollToRequiredBlock(!scrollToRequiredBlock)
      return
    }

    const hasRequiredFields =
      orderDetailsValues.name_label &&
      orderDetailsValues.surname_label &&
      orderDetailsValues.phone_label

    if (!hasRequiredFields) {
      setScrollToRequiredBlock(!scrollToRequiredBlock)
      return
    }

    if(!isUserAuth()) {
      handleopenAuthModal()
      return
    }

    const auth = JSON.parse(localStorage.getItem('auth') as string)
    let description = ''

    if (chosenCourierAddressData.address_line1) {
      // eslint-disable-next-line max-len
      description = `Адреса доставки товару кур'єром: ${chosenCourierAddressData.address_line1}, ${chosenCourierAddressData.address_line2}`
    }

    if (chosenPickupAddressData.address_line1) {
      // eslint-disable-next-line max-len
      description = `Адреса отримання товару: ${chosenPickupAddressData.address_line1}, ${chosenPickupAddressData.address_line2}`
    }

    if (chosenNovaPoshtaAddressData.address_line1) {
      // eslint-disable-next-line max-len
      description = `Доставка на відділення Нової Пошти: ${chosenNovaPoshtaAddressData.address_line1}, ${chosenNovaPoshtaAddressData.address_line2}`
    }

    makePayment({
      amount: `${priceWithDiscount.replace(' ', '')}`,
      description,
      jwt: auth.accessToken,
      orderDetails: orderDetailsValues,
      cartItems: currentCartByAuth.map(item => ({
        name: item.name,
        size: item.size,
        count: item.count,
        price: item.price,
      })),
    })
  }

  return (
    <div className={styles.order_block}>
      <div className={styles.order_block__inner}>
        <p className={styles.order_block__info}>
          {countWholeCartItemsAmount(currentCartByAuth)}{' '}
          {showCountMessage(
            `${countWholeCartItemsAmount(currentCartByAuth)}`,
            lang
          )}{' '}
          {translations[lang].order.worth}{' '}
          <span className={styles.order_block__info__text}>
            {formatPrice(animatedPrice)} ₴
          </span>
        </p>
        <p className={styles.order_block__info}>
          {translations[lang].order.amount_with_discounts}:{' '}
          <span className={styles.order_block__info__text}>
            {priceWithDiscount} ₴
          </span>
        </p>
        {isOrderPage && (
          <>
            <p className={styles.order_block__info}>
              {translations[lang].order.delivery}:{' '}
              <span className={styles.order_block__info__text}>
                {pickupTab
                  ? translations[lang].order.pickup_free
                  : translations[lang].order.courier_delivery}
              </span>
            </p>
            <p className={styles.order_block__info}>
              {translations[lang].order.payment}:{' '}
              <span className={styles.order_block__info__text}>
                {onlinePaymentTab
                  ? translations[lang].order.online_payment
                  : translations[lang].order.upon_receipt}
              </span>
            </p>
          </>
        )}
        <p className={styles.order_block__total}>
          <span>{translations[lang].order.total}:</span>
          <span className={styles.order_block__total__price}>
            {priceWithDiscount} ₴
          </span>
        </p>
        {isOrderPage ? (
          <button className={`btn-reset ${styles.order_block__btn}`} disabled={!isUserAgree || !currentCartByAuth.length || false}
            onClick={handleMakePayment}>
            {false ? (
              <FontAwesomeIcon icon={faSpinner} spin color='#fff' />
            ) : (
              translations[lang].order.make_order
            )}
          </button>
        ) : (
          <Link
            href='/order'
            className={`${styles.order_block__btn} ${!isUserAgree || !currentCartByAuth.length ? styles.disabled : ''}`}
          >
            {translations[lang].order.make_order}
          </Link>
        )}
        <label className={styles.order_block__agreement}>
          <input
            className={styles.order_block__agreement__input}
            type='checkbox'
            tabIndex={-1}
            ref={checkboxRef}
            onChange={handleAgreementChange}
            checked={isUserAgree}
          />
          <span className={styles.order_block__agreement__mark} />
          <span
            className={styles.order_block__agreement__checkbox}
            tabIndex={0}
            onKeyDown={handleTabCheckbox}
          />
          <span className={styles.order_block__agreement__text}>
            {translations[lang].order.agreement_text}{' '}
            <Link
              href='/privacy'
              className={styles.order_block__agreement__link}
            >
              {translations[lang].order.agreement_link}
            </Link>
          </span>
        </label>
      </div>
    </div>
  )
}

export default OrderInfoBlock
