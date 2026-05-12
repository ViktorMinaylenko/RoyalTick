'use client'
import { useUnit } from 'effector-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { checkPaymentFx, paymentNotifyFx } from '@/context/order'
import { useLang } from '@/hooks/useLang'
import { handleDeleteAllFromCart } from '@/lib/utils/cart'
import { formatPrice, isUserAuth } from '@/lib/utils/common'
import { IPaymentData } from '@/types/order'
import WatchedProducts from '@/components/modules/WatchedProducts/WatchedProducts'
import { useWatchedProducts } from '@/hooks/useWatchedProducts'
import styles from '@/styles/payment-success/index.module.scss'
import { $user } from '@/context/user/state'

function PaymentSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { lang, translations } = useLang()
    const spinner = useUnit(checkPaymentFx.pending)
    const [paymentData, setPaymentData] = useState<IPaymentData>({} as IPaymentData)
    const [pageSpinner, setPageSpinner] = useState(true)
    const [isSuccess, setIsSuccess] = useState(false)
    const { watchedProducts } = useWatchedProducts()
    const user = useUnit($user)

    useEffect(() => {
        const statusFromUrl = searchParams.get('status')
        const orderReferenceFromUrl = searchParams.get('orderReference')

        const orderReferenceRaw = localStorage.getItem('orderReference')
        const orderReferenceFromLS = orderReferenceRaw ? JSON.parse(orderReferenceRaw) : null

        const amountRaw = localStorage.getItem('paymentAmount')
        const amountFromLS = amountRaw ? JSON.parse(amountRaw) : 0

        const orderReference = orderReferenceFromUrl || orderReferenceFromLS

        if (!orderReference) {
            setPageSpinner(false)
            router.push('/404')
            return
        }

        if (statusFromUrl === 'Approved' || statusFromUrl === 'success') {
            const authRaw = localStorage.getItem('auth')
            const auth = authRaw ? JSON.parse(authRaw) : null

            const orderDetailsRaw = localStorage.getItem('orderDetails')
            const orderDetails = orderDetailsRaw ? JSON.parse(orderDetailsRaw) : {}

            const cartRaw = localStorage.getItem('orderCart')
            const cartItems = cartRaw ? JSON.parse(cartRaw) : []

            const description = localStorage.getItem('orderDescription') || ''

            if (isUserAuth() && auth?.accessToken) {
                handleDeleteAllFromCart(auth.accessToken)
            }

            setPaymentData({ orderReference, amount: amountFromLS } as IPaymentData)
            setIsSuccess(true)

            paymentNotifyFx({
                email: orderDetails?.email_label || user.email || '',
                orderReference,
                amount: amountFromLS,
                description,
                orderDetails,
                cartItems,
            })

            localStorage.removeItem('orderReference')
            localStorage.removeItem('paymentAmount')
            localStorage.removeItem('orderDescription')
            localStorage.removeItem('orderDetails')
            localStorage.removeItem('orderCart')
            setPageSpinner(false)
            return
        }

        if (orderReference && isUserAuth()) {
            checkPaymentFx({ orderReference }).then((data) => {
                if (data) {
                    if (data.transactionStatus === 'Approved' || data.status === 'Approved') {
                        const authRaw = localStorage.getItem('auth')
                        const auth = authRaw ? JSON.parse(authRaw) : null
                        if (auth?.accessToken) {
                            handleDeleteAllFromCart(auth.accessToken)
                        }
                        setPaymentData({ ...data, amount: amountFromLS })
                        setIsSuccess(true)
                        localStorage.removeItem('orderReference')
                        localStorage.removeItem('paymentAmount')
                    }
                }
                setPageSpinner(false)
            })
        } else {
            setPageSpinner(false)
        }
    }, [])


    return (
        <main>
            {pageSpinner ? (
                <span className={styles.payment_success__spinner}>
                    <FontAwesomeIcon icon={faSpinner} spin color='#fff' size='4x' />
                </span>
            ) : (
                <>
                    <section className={styles.payment_success}>
                        <div className={`container ${styles.payment_success__container}`}>
                            <span className={styles.payment_success__bg}>
                                {translations[lang].payment_success.thanks}
                            </span>
                            <div className={styles.payment_success__inner}>
                                {isSuccess ? (
                                    <>
                                        <h1 className={styles.payment_success__heading}>
                                            {translations[lang].payment_success.thanks_text}
                                        </h1>
                                        <p
                                            className={styles.payment_success__info}
                                            dangerouslySetInnerHTML={{
                                                __html: `${translations[lang].payment_success.order_info
                                                    .replace('1-info', `<span>№${paymentData.orderReference}</span>`)
                                                    .replace('2-info', `<span>${formatPrice(+(paymentData.amount || 0)).replace(/\s/g, '\u00A0')}\u00A0₴</span>`)}`,
                                            }}
                                        />
                                        <p
                                            className={styles.payment_success__description}
                                            dangerouslySetInnerHTML={{
                                                __html: translations[lang].payment_success.order_description,
                                            }}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h1 className={styles.payment_success__heading}>
                                            Оплата не пройшла
                                        </h1>
                                        <p className={styles.payment_success__info}>
                                            Щось пішло не так. Спробуйте ще раз або зверніться до підтримки.
                                        </p>
                                    </>
                                )}
                                <div className={styles.payment_success__actions}>
                                    {isSuccess ? (
                                        <>
                                            <Link href='/catalog' className={styles.payment_success__actions__link}>
                                                {translations[lang].payment_success.continue_shopping}
                                            </Link>
                                            <Link href='/' className={styles.payment_success__actions__link}>
                                                {translations[lang].payment_success.go_main}
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href='/order' className={styles.payment_success__actions__link}>
                                                Спробувати ще раз
                                            </Link>
                                            <Link href='/' className={styles.payment_success__actions__link}>
                                                {translations[lang].payment_success.go_main}
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                    <section>
                        <div className='container'>
                            {!!watchedProducts.items?.length && (
                                <WatchedProducts watchedProducts={watchedProducts} />
                            )}
                        </div>
                    </section>
                </>
            )}
        </main>
    )
}

export default function PaymentSuccess() {
    return (
        <Suspense fallback={
            <span className={styles.payment_success__spinner}>
                <FontAwesomeIcon icon={faSpinner} spin color='#fff' size='4x' />
            </span>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}