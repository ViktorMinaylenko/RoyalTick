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
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import Link from 'next/link'
import { useCountdown } from '@/hooks/useCountdown'
import { useLotBid } from '@/hooks/useLotBid'
import { useLotComments } from '@/hooks/useLotComments'
import ModeratorStatusPanel from '@/components/modules/LotPage/ModeratorStatusPanel'
import BuyNowModal from '@/components/modules/LotPage/BuyNowModal'
import LotComments from '@/components/modules/LotPage/LotComments'
import LotSellerLots from '@/components/modules/LotPage/LotSellerLots'
import LotGallery from '@/components/modules/LotPage/LotGallery'

const LotPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const params = useParams()
    const router = useRouter()
    const user = useUnit($user) as any
    const isModerator = user?.role === 'moderator' || user?.role === 'admin'

    const [lot, setLot] = useState<ILot | null>(null)
    const [spinner, setSpinner] = useState(true)
    const [activeImg, setActiveImg] = useState('')
    const [activeTab, setActiveTab] = useState<'description' | 'photos'>('description')
    const [showBuyNowModal, setShowBuyNowModal] = useState(false)
    const [buyNowConfirmed, setBuyNowConfirmed] = useState(false)
    const [buyNowSpinner, setBuyNowSpinner] = useState(false)
    const [sellerLots, setSellerLots] = useState<any[]>([])

    useEffect(() => {
        if (lot?.title) {
            const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
            if (lastCrumb) lastCrumb.textContent = lot.title
        }
    }, [lot?.title])

    const timeLeft = useCountdown(lot?.endDate || '')

    const { bidAmount, setBidAmount, bidSpinner, handleBid, initBidAmount } = useLotBid(
        String(params.id),
        lot,
        setLot as (lot: ILot) => void
    )

    const {
        comments, commentText, setCommentText,
        commentSpinner, fetchComments, handleComment,
    } = useLotComments(String(params.id))

    useEffect(() => {
        const fetchLot = async () => {
            try {
                const res = await fetch(`/api/auction/lots/${params.id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setLot(data.lot)
                    setActiveImg(data.lot.mainPhotoUrl)
                    initBidAmount(data.lot.currentPrice, data.lot.bidStep)

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
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }
        if (params.id) fetchLot()
    }, [params.id])

    useEffect(() => {
        if (!lot?.userId) return
        const fetchSellerLots = async () => {
            try {
                const res = await fetch(`/api/auction/lots?userId=${lot.userId}&limit=10`)
                const data = await res.json()
                if (data.status === 200) {
                    setSellerLots(data.lots.filter((l: any) => l._id !== lot._id))
                }
            } catch (error) {
                console.error(error)
            }
        }
        fetchSellerLots()
    }, [lot?.userId])

    useEffect(() => {
        if (params.id) fetchComments()
    }, [params.id])

    const isOwner = lot && user?._id && String(lot.userId) === String(user._id)
    const isExpired = lot && new Date() > new Date(lot.endDate)
    const canBid = !isOwner && !isExpired && isUserAuth()
    const isHighestBidder = !!(lot?.bids?.length && lot.bids.length > 0 &&
        String(lot.bids[lot.bids.length - 1].userId) === String(user?._id))

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

    const handleStatusChange = (newStatus: string) => {
        setLot((prev: any) => prev ? { ...prev, status: newStatus } : prev)
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
                            <Link href={`/user/${lot.userId}`} style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
                                {lot.userName}
                            </Link>
                        </div>
                    </div>

                    <div className={styles.lot_page__body}>

                        <LotGallery
                            images={allImages}
                            activeImg={activeImg}
                            lotTitle={lot.title}
                            onThumbClick={setActiveImg}
                        />

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

                            {isModerator && (
                                <ModeratorStatusPanel
                                    lotId={String(lot._id)}
                                    currentStatus={lot.status}
                                    onStatusChange={handleStatusChange}
                                />
                            )}

                            <div className={styles.lot_page__price_block}>
                                <span className={styles.lot_page__price_label}>
                                    {t.current_price} ({lot.bids.length} {t.bids_word})
                                </span>
                                <span className={styles.lot_page__price}>
                                    {formatPrice(lot.currentPrice)} ₴
                                </span>
                            </div>

                            {isHighestBidder && !isOwner && (
                                <div className={styles.lot_page__highest_bid}>
                                    ✅ {t.your_bid_highest}
                                </div>
                            )}

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
                                    <tr><td>{t.condition}</td><td>{t[`condition_${lot.condition}`]}</td></tr>
                                    <tr><td>{t.location}</td><td>{lot.location}</td></tr>
                                    <tr>
                                        <td>{t.delivery_method}</td>
                                        <td>{lot.deliveryMethods.map((d) => t[`delivery_${d}`]).join(', ')}</td>
                                    </tr>
                                    <tr>
                                        <td>{t.delivery_payer}</td>
                                        <td>{lot.deliveryPayer === 'buyer' ? t.payer_buyer : t.payer_seller}</td>
                                    </tr>
                                    <tr><td>{t.returns}</td><td>{lot.returnsAllowed ? t.yes : t.no}</td></tr>
                                    {lot.guarantees && <tr><td>{t.guarantees}</td><td>{lot.guarantees}</td></tr>}
                                    {lot.buyerComment && <tr><td>{t.buyer_comment}</td><td>{lot.buyerComment}</td></tr>}
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

                    <LotSellerLots lots={sellerLots} sellerName={lot.userName} />

                    <LotComments
                        comments={comments}
                        commentText={commentText}
                        commentSpinner={commentSpinner}
                        userId={String(user?._id)}
                        onTextChange={setCommentText}
                        onSubmit={handleComment}
                    />

                </div>
            </section>

            <BuyNowModal
                show={showBuyNowModal}
                buyNowPrice={lot.buyNowPrice!}
                confirmed={buyNowConfirmed}
                spinner={buyNowSpinner}
                onClose={() => setShowBuyNowModal(false)}
                onConfirmChange={setBuyNowConfirmed}
                onConfirm={handleBuyNow}
            />
        </main>
    )
}

export default LotPage