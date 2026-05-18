'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { formatPrice, isUserAuth } from '@/lib/utils/common'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import styles from '@/styles/auction/index.module.scss'
import { handleopenAuthModal } from '@/lib/utils/common'
import { ILot } from '@/types/lots'
import { AnimatePresence, motion } from 'framer-motion'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'

const useCountdown = (endDate: string) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate).getTime() - Date.now()
            if (diff <= 0) { setTimeLeft('00:00:00'); return }
            const d = Math.floor(diff / 86400000)
            const h = Math.floor((diff % 86400000) / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(`${d > 0 ? `${d} д ` : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`)
        }
        calc()
        const timer = setInterval(calc, 1000)
        return () => clearInterval(timer)
    }, [endDate])

    return timeLeft
}

const LotPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const params = useParams()
    const router = useRouter()
    const user = useUnit($user) as any  // 👈 додано

    const [lot, setLot] = useState<ILot | null>(null)
    const [spinner, setSpinner] = useState(true)
    const [activeImg, setActiveImg] = useState('')
    const [bidAmount, setBidAmount] = useState(0)
    const [bidSpinner, setBidSpinner] = useState(false)
    const [activeTab, setActiveTab] = useState<'description' | 'photos'>('description')
    const [showBuyNowModal, setShowBuyNowModal] = useState(false)
    const [buyNowConfirmed, setBuyNowConfirmed] = useState(false)
    const [buyNowSpinner, setBuyNowSpinner] = useState(false)
    const timeLeft = useCountdown(lot?.endDate || '')


    useEffect(() => {
        const fetchLot = async () => {
            try {
                const res = await fetch(`/api/auction/lots/${params.id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setLot(data.lot)
                    setActiveImg(data.lot.mainPhotoUrl)
                    setBidAmount(data.lot.currentPrice + data.lot.bidStep)

                    const isExpired = new Date() > new Date(data.lot.endDate)
                    if (isExpired && data.lot.status === 'active') {
                        await fetch('/api/auction/lots/finalize', { method: 'POST' })
                        const refreshed = await fetch(`/api/auction/lots/${params.id}`)
                        const refreshedData = await refreshed.json()
                        if (refreshedData.status === 200) setLot(refreshedData.lot)
                    }
                } else {
                    router.push('/auction')
                }
            } catch (error) {
                console.error('Lot fetch error:', error)
            } finally {
                setSpinner(false)
            }
        }
        if (params.id) fetchLot()
    }, [params.id])

    const isOwner = lot && user?._id && String(lot.userId) === String(user._id)
    const isExpired = lot && new Date() > new Date(lot.endDate)
    const canBid = !isOwner && !isExpired && isUserAuth()

    const handleBid = async () => {
        if (!isUserAuth()) {
            handleopenAuthModal()
            return
        }

        if (isOwner) {
            toast.error(t.bid_own_lot_error)
            return
        }

        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setBidSpinner(true)

        try {
            const res = await fetch(`/api/auction/lots/${params.id}/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ bidAmount }),
            })

            const data = await res.json()
            if (data.status === 200) {
                setLot(data.lot)
                setBidAmount(data.lot.currentPrice + data.lot.bidStep)
                toast.success(t.bid_success)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error(t.error_generic)
        } finally {
            setBidSpinner(false)
        }
    }

    const handleBuyNow = async () => {
        if (!lot) return
        setBuyNowSpinner(true)
        const auth = JSON.parse(localStorage.getItem('auth') as string)

        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ lotId: lot._id }),
            })
            const data = await res.json()
            if (data.status === 201 || data.status === 200) {
                setShowBuyNowModal(false)
                router.push(`/chats/${data.chat._id}`)
            }
        } catch (error) {
            console.error(error)
            toast.error(t.error_generic)
        } finally {
            setBuyNowSpinner(false)
        }
    }

    const allImages = lot ? [lot.mainPhotoUrl, ...lot.additionalPhotoUrls].filter(Boolean) : []

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })

    if (spinner) {
        return (
            <main>
                <section className={styles.lot_page}>
                    <div className='container'>
                        <div className={styles.lot_page__skeleton} />
                    </div>
                </section>
            </main>
        )
    }

    if (!lot) return null

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.lot_page}>
                <div className='container'>

                    <h1 className={styles.lot_page__title}>{lot.title}</h1>

                    <div className={styles.lot_page__meta}>
                        <div className={styles.lot_page__meta__item}>
                            <span className={styles.lot_page__meta__label}>{t.bids_count}:</span>
                            <strong>{lot.bids.length}</strong>
                        </div>
                        <div className={styles.lot_page__meta__item}>
                            <span className={styles.lot_page__meta__label}>{t.max_bid}:</span>
                            <strong>{formatPrice(lot.currentPrice)} ₴</strong>
                        </div>
                        <div className={styles.lot_page__meta__item}>
                            <span className={styles.lot_page__meta__label}>{t.added}:</span>
                            <strong>{formatDate(lot.createdAt)}</strong>
                        </div>
                        <div className={styles.lot_page__meta__item}>
                            <span className={styles.lot_page__meta__label}>{t.seller}:</span>
                            <strong>{lot.userName}</strong>
                        </div>
                    </div>

                    <div className={styles.lot_page__body}>

                        <div className={styles.lot_page__gallery}>
                            <div className={styles.lot_page__gallery__main}>
                                <img src={activeImg || '/img/no-image.jpg'} alt={lot.title} />
                            </div>
                            {allImages.length > 1 && (
                                <div className={styles.lot_page__gallery__thumbs}>
                                    {allImages.map((img, i) => (
                                        <button
                                            key={i}
                                            className={`btn-reset ${styles.lot_page__gallery__thumb} ${activeImg === img ? styles.lot_page__gallery__thumb_active : ''}`}
                                            onClick={() => setActiveImg(img)}
                                        >
                                            <img src={img} alt={`thumb-${i}`} />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.lot_page__sidebar}>

                            <div className={styles.lot_page__timing}>
                                <div>
                                    <p className={styles.lot_page__timing__label}>{t.end_date}</p>
                                    <p className={styles.lot_page__timing__value}>{formatDate(lot.endDate)}</p>
                                </div>
                                <div>
                                    <p className={styles.lot_page__timing__label}>{t.time_left}</p>
                                    <p className={styles.lot_page__timing__countdown}>
                                        {isExpired ? t.expired : timeLeft}
                                    </p>
                                </div>
                            </div>

                            {lot.status === 'reserved' && (
                                <div className={styles.lot_page__reserved}>
                                    🔒 {t.reserved}
                                </div>
                            )}

                            <div className={styles.lot_page__price_block}>
                                <span className={styles.lot_page__price_label}>
                                    {t.current_price} ({lot.bids.length} {t.bids_word})
                                </span>
                                <span className={styles.lot_page__price}>
                                    {formatPrice(lot.currentPrice)} ₴
                                </span>
                            </div>

                            {!isExpired && lot.status !== 'reserved' && (
                                <div className={styles.lot_page__bid}>
                                    <p className={styles.lot_page__bid__label}>{t.make_bid}</p>
                                    <div className={styles.lot_page__bid__input_row}>
                                        <button
                                            className={`btn-reset ${styles.lot_page__bid__step_btn}`}
                                            onClick={() => setBidAmount((prev) => Math.max(lot.currentPrice + lot.bidStep, prev - lot.bidStep))}
                                            disabled={!canBid}
                                        >−</button>
                                        <div className={styles.lot_page__bid__input_wrap}>
                                            <input
                                                type='number'
                                                value={bidAmount}
                                                onChange={(e) => setBidAmount(Number(e.target.value))}
                                                disabled={!canBid}
                                                className={styles.lot_page__bid__input}
                                            />
                                            <span>₴</span>
                                        </div>
                                        <button
                                            className={`btn-reset ${styles.lot_page__bid__step_btn}`}
                                            onClick={() => setBidAmount((prev) => prev + lot.bidStep)}
                                            disabled={!canBid}
                                        >+</button>
                                    </div>
                                    <p className={styles.lot_page__bid__step_hint}>
                                        {t.bid_step_hint} {formatPrice(lot.bidStep)} ₴
                                    </p>

                                    {isOwner ? (
                                        <div className={styles.lot_page__bid__owner_msg}>
                                            {t.bid_own_lot_error}
                                        </div>
                                    ) : (
                                        <button
                                            className={`btn-reset ${styles.lot_page__bid__submit}`}
                                            onClick={handleBid}
                                            disabled={bidSpinner || !canBid}
                                        >
                                            {bidSpinner ? '...' : t.make_bid_btn}
                                        </button>
                                    )}
                                </div>
                            )}

                            {lot.buyNowPrice && !isExpired && !isOwner && lot.status !== 'reserved' && (
                                <button
                                    className={`btn-reset ${styles.lot_page__buy_now}`}
                                    onClick={() => {
                                        if (!isUserAuth()) { handleopenAuthModal(); return }
                                        if (isOwner) { toast.error(t.bid_own_lot_error); return }
                                        setBuyNowConfirmed(false)
                                        setShowBuyNowModal(true)
                                    }}
                                >
                                    {t.buy_now} — {formatPrice(lot.buyNowPrice)} ₴
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.lot_page__tabs}>
                        <button
                            className={`btn-reset ${styles.lot_page__tab} ${activeTab === 'description' ? styles.lot_page__tab_active : ''}`}
                            onClick={() => setActiveTab('description')}
                        >{t.tab_description}</button>
                        <button
                            className={`btn-reset ${styles.lot_page__tab} ${activeTab === 'photos' ? styles.lot_page__tab_active : ''}`}
                            onClick={() => setActiveTab('photos')}
                        >{t.tab_photos} {allImages.length}</button>
                    </div>

                    {activeTab === 'description' && (
                        <div className={styles.lot_page__description}>
                            <table className={styles.lot_page__desc_table}>
                                <tbody>
                                    <tr>
                                        <td>{t.condition}</td>
                                        <td>{t[`condition_${lot.condition}`]}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.location}</td>
                                        <td>{lot.location}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.delivery_method}</td>
                                        <td>{lot.deliveryMethods.map((d) => t[`delivery_${d}`]).join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.delivery_payer}</td>
                                        <td>{lot.deliveryPayer === 'buyer' ? t.payer_buyer : t.payer_seller}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.returns}</td>
                                        <td>{lot.returnsAllowed ? t.yes : t.no}</td>
                                    </tr>
                                    {lot.guarantees && (
                                        <tr>
                                            <td>{t.guarantees}</td>
                                            <td>{lot.guarantees}</td>
                                        </tr>
                                    )}
                                    {lot.buyerComment && (
                                        <tr>
                                            <td>{t.buyer_comment}</td>
                                            <td>{lot.buyerComment}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            {lot.description && (
                                <div className={styles.lot_page__desc_text}>
                                    <strong>{t.description}:</strong>
                                    <p>{lot.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'photos' && (
                        <div className={styles.lot_page__photos_grid}>
                            {allImages.map((img, i) => (
                                <div key={i} className={styles.lot_page__photos_grid__item}>
                                    <img src={img} alt={`photo-${i}`} />
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </section>

            <AnimatePresence>
                {showBuyNowModal && (
                    <motion.div
                        className={styles.buy_now_modal}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setShowBuyNowModal(false)
                        }}
                    >
                        <motion.div
                            className={styles.buy_now_modal__inner}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                        >
                            <button
                                className={`btn-reset ${styles.buy_now_modal__close}`}
                                onClick={() => setShowBuyNowModal(false)}
                            />
                            <span className={styles.buy_now_modal__icon}>🔨</span>
                            <h2 className={styles.buy_now_modal__title}>
                                {t.buy_now_modal_title}
                            </h2>
                            <span className={styles.buy_now_modal__price}>
                                {formatPrice(lot.buyNowPrice!)} ₴
                            </span>
                            <p className={styles.buy_now_modal__text}>
                                {t.buy_now_modal_text}
                            </p>
                            <div className={styles.buy_now_modal__warning}>
                                ⚠️ {t.buy_now_modal_warning}
                            </div>
                            <label className={styles.buy_now_modal__checkbox}>
                                <input
                                    type='checkbox'
                                    checked={buyNowConfirmed}
                                    onChange={(e) => setBuyNowConfirmed(e.target.checked)}
                                />
                                <span>{t.buy_now_modal_confirm_text}</span>
                            </label>
                            <div className={styles.buy_now_modal__buttons}>
                                <button
                                    className={`btn-reset ${styles.buy_now_modal__cancel}`}
                                    onClick={() => setShowBuyNowModal(false)}
                                >
                                    {t.buy_now_modal_cancel}
                                </button>
                                <button
                                    className={`btn-reset ${styles.buy_now_modal__confirm}`}
                                    onClick={handleBuyNow}
                                    disabled={!buyNowConfirmed || buyNowSpinner}
                                >
                                    {buyNowSpinner ? '...' : t.buy_now_modal_confirm}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}

export default LotPage