'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import OrderInfoBlock from '@/components/modules/OrderInfoBlock/OrderInfoBlock'
import MapModal from '@/components/modules/OrderPage/MapModal'
import OrderCartItem from '@/components/modules/OrderPage/OrderCartItem'
import OrderDelivery from '@/components/modules/OrderPage/OrderDelivery'
import OrderDetailsForm from '@/components/modules/OrderPage/OrderDetailsForm'
import OrderPayment from '@/components/modules/OrderPage/OrderPayment'
import OrderTitle from '@/components/modules/OrderPage/OrderTitle'
import { basePropsForMotion } from '@/constants/motion'
import { $cart, $cartFromLs } from '@/context/cart/state'
import { $mapModal } from '@/context/modals/state'
import { $scrollToRequiredBlock } from '@/context/order/state'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useGoodsByAuth } from '@/hooks/useGoodsByAuth'
import { useLang } from '@/hooks/useLang'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { isUserAuth } from '@/lib/utils/common'
import styles from '@/styles/order/index.module.scss'
import { useUnit } from 'effector-react'
import { AnimatePresence, motion } from 'framer-motion'
import router from 'next/dist/shared/lib/router/router'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

const OrderPage = () => {

    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('order')
    const { lang, translations } = useLang()
    const currentCartByAuth = useGoodsByAuth($cart, $cartFromLs)
    const isMedia1220 = useMediaQuery(1220)
    const mapModal = useUnit($mapModal)
    const shouldScrollToDelivery = useRef(true)
    const [isFirstRender, setIsFirstRender] = useState(true)
    const scrollToRequiredBlock = useUnit($scrollToRequiredBlock)
    const deliveryBlockRef = useRef<HTMLLIElement>(null!)

    const scrollToBlock = (selector: HTMLLIElement) =>
        window.scrollTo({
            top: selector.getBoundingClientRect().top + window.scrollY + -50,
            behavior: 'smooth',
        })

    useEffect(() => {
        if (shouldScrollToDelivery.current) {
            shouldScrollToDelivery.current = false
            setIsFirstRender(false)
        }

        clearCartByPayment()
    }, [])

    useEffect(() => {
        if (isFirstRender) {
            return
        }

        scrollToBlock(deliveryBlockRef.current)
        toast.error('Потрібно вказати адресу!')

    }, [scrollToRequiredBlock])

    const clearCartByPayment = async () => {
        const paymentId = JSON.parse(localStorage.getItem('paymentId') as string)

        if (!isUserAuth() || !paymentId) {
            return
        }
    }

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.order}>
                <div className="container">
                    <h1 className={styles.order__title}>{translations[lang].breadcrumbs.order}</h1>
                    <div className={styles.order__inner}>
                        <div className={styles.order__inner__left}>
                            <ul className={`list-reset ${styles.order__list}`}>
                                <li className={styles.order__list__item}>
                                    <OrderTitle orderNumber='1' text={translations[lang].order.order} />
                                    <div suppressHydrationWarning>
                                        {isMedia1220 ? (
                                            <ul className={`list-reset ${styles.order__list__item__list}`}>
                                                {currentCartByAuth.map((item, i) => (
                                                    <OrderCartItem key={item._id || item.clientId} item={item} position={i + 1} isMobile={true} />
                                                ))}
                                            </ul>
                                        ) : (
                                            <table className={styles.order__list__item__table}>
                                                <thead>
                                                    <tr>
                                                        <th>{translations[lang].order.name}</th>
                                                        <th>{translations[lang].order.allSize}</th>
                                                        <th>{translations[lang].order.count}</th>
                                                        <th>{translations[lang].order.sum}</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentCartByAuth.map((item, i) => (
                                                        <OrderCartItem key={item._id || item.clientId} item={item} position={i + 1} isMobile={false} />
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </li>
                                <li className={styles.order__list__item} ref={deliveryBlockRef}>
                                    <OrderDelivery />
                                </li>
                                <li className={styles.order__list__item}>
                                    <OrderTitle orderNumber='3' text={translations[lang].order.payment} />
                                    <OrderPayment />
                                </li>
                                <li className={styles.order__list__item}>
                                    <OrderTitle orderNumber='4' text={translations[lang].order.recipient_details} />
                                    <div className={styles.order__list__item__details}>
                                        <p className={styles.order__list__item__details__title}>
                                            {translations[lang].order.enter_details}
                                        </p>
                                        <OrderDetailsForm />
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className={styles.order__inner__right}>
                            <div className={styles.order__inner__right__order}>
                                <OrderInfoBlock isOrderPage />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <AnimatePresence>
                {mapModal && (
                    <motion.div className={styles.map_modal} {...basePropsForMotion}>
                        <MapModal />
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default OrderPage