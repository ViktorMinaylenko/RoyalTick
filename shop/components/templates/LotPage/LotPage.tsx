'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { formatPrice, formatLotDate, isUserAuth } from '@/lib/utils/common'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import styles from '@/styles/auction/index.module.scss'
import { handleopenAuthModal } from '@/lib/utils/common'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import Link from 'next/link'
import { useCountdown } from '@/hooks/useCountdown'
import { useLotBid } from '@/hooks/useLotBid'
import { useLotComments } from '@/hooks/useLotComments'
import { useLotData } from '@/hooks/useLotData'
import { useSellerLots } from '@/hooks/useSellerLots'
import { useBuyNow } from '@/hooks/useBuyNow'
import { usePriceProposal } from '@/hooks/usePriceProposal'
import { ILot } from '@/types/lots'
import ModeratorStatusPanel from '@/components/modules/LotPage/ModeratorStatusPanel'
import BuyNowModal from '@/components/modules/LotPage/BuyNowModal'
import LotComments from '@/components/modules/LotPage/LotComments'
import LotSellerLots from '@/components/modules/LotPage/LotSellerLots'
import LotGallery from '@/components/modules/LotPage/LotGallery'
import LotPriceProposal from '@/components/modules/LotPage/LotPriceProposal'
import LotSellerProposal from '@/components/modules/LotPage/LotSellerProposal'

const LotPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const params = useParams()
    const user = useUnit($user) as any
    const isModerator = user?.role === 'moderator' || user?.role === 'admin'

    const [activeImg, setActiveImg] = useState('')
    const [activeTab, setActiveTab] = useState<'description' | 'photos'>('description')
    
    

    const { bidAmount, setBidAmount, bidSpinner, handleBid, initBidAmount } = useLotBid(
        String(params.id),
        null,
        () => { }
    )

    const { lot, setLot, spinner } = useLotData(
        String(params.id),
        initBidAmount,
        setActiveImg
    )

    const { sellerLots } = useSellerLots(lot)

    const {
        showBuyNowModal, setShowBuyNowModal,
        buyNowConfirmed, setBuyNowConfirmed,
        buyNowSpinner, handleBuyNow,
    } = useBuyNow(lot, t)

    const {
        proposalAmount, setProposalAmount,
        proposalComment, setProposalComment,
        proposalSpinner, respondSpinner,
        handleProposePrice, handleRespondPrice,
    } = usePriceProposal(String(params.id), t, setLot as (updater: (prev: ILot | null) => ILot | null) => void)

    const {
        comments, commentText, setCommentText,
        commentSpinner, fetchComments, handleComment,
    } = useLotComments(String(params.id))

    const isFixedPrice = lot?.saleType === 'fixed_price'
    const isOwner = lot && user?._id && String(lot.userId) === String(user._id)
    const isExpired = lot && new Date() > new Date(lot.endDate)
    const canBid = !isOwner && !isExpired && isUserAuth()
    const isHighestBidder = !!(lot?.bids?.length && lot.bids.length > 0 &&
        String(lot.bids[lot.bids.length - 1].userId) === String(user?._id))
    const priceProposal = lot?.priceProposal
    const timeLeft = useCountdown(lot?.endDate || '')

    const handleStatusChange = (newStatus: string) => {
        setLot((prev: any) => prev ? { ...prev, status: newStatus } : prev)
    }

    const allImages = lot ? [lot.mainPhotoUrl, ...lot.additionalPhotoUrls].filter(Boolean) : []

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
                        {!isFixedPrice && (
                            <>
                                <div className={styles.lot_page__meta__item}>
                                    <span className={styles.lot_page__meta__label}>{t.bids_count}:</span>
                                    <strong>{lot.bids.length}</strong>
                                </div>
                                <div className={styles.lot_page__meta__item}>
                                    <span className={styles.lot_page__meta__label}>{t.max_bid}:</span>
                                    <strong>{formatPrice(lot.currentPrice)} ₴</strong>
                                </div>
                            </>
                        )}
                        <div className={styles.lot_page__meta__item}>
                            <span className={styles.lot_page__meta__label}>{t.added}:</span>
                            <strong>{formatLotDate(lot.createdAt, lang)}</strong>
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

                            {!isFixedPrice && (
                                <div className={styles.lot_page__timing}>
                                    <div>
                                        <p className={styles.lot_page__timing__label}>{t.end_date}</p>
                                        <p className={styles.lot_page__timing__value}>{formatLotDate(lot.endDate, lang)}</p>
                                    </div>
                                    <div>
                                        <p className={styles.lot_page__timing__label}>{t.time_left}</p>
                                        <p className={styles.lot_page__timing__countdown}>
                                            {isExpired ? t.expired : timeLeft}
                                        </p>
                                    </div>
                                </div>
                            )}

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
                                    {isFixedPrice
                                        ? t.sale_type_fixed_price
                                        : `${t.current_price} (${lot.bids.length} ${t.bids_word})`}
                                </span>
                                <span className={styles.lot_page__price}>
                                    {formatPrice(lot.currentPrice)} ₴
                                </span>
                            </div>

                            {!isFixedPrice && isHighestBidder && !isOwner && (
                                <div className={styles.lot_page__highest_bid}>
                                    ✅ {t.your_bid_highest}
                                </div>
                            )}

                            {!isFixedPrice && !isExpired && lot.status !== 'reserved' && (
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

                            {isFixedPrice && !isOwner && lot.status !== 'reserved' && (
                                <button
                                    className={`btn-reset ${styles.lot_page__buy_now}`}
                                    onClick={() => {
                                        if (!isUserAuth()) { handleopenAuthModal(); return }
                                        setBuyNowConfirmed(false)
                                        setShowBuyNowModal(true)
                                    }}
                                >
                                    {t.buy_now} — {formatPrice(lot.currentPrice)} ₴
                                </button>
                            )}

                            {!isFixedPrice && lot.buyNowPrice && !isExpired && !isOwner && lot.status !== 'reserved' && (
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

                            {isFixedPrice && !isOwner && lot.status !== 'reserved' && (
                                <LotPriceProposal
                                    t={t}
                                    priceProposal={priceProposal}
                                    proposalAmount={proposalAmount}
                                    proposalComment={proposalComment}
                                    proposalSpinner={proposalSpinner}
                                    onAmountChange={setProposalAmount}
                                    onCommentChange={setProposalComment}
                                    onPropose={handleProposePrice}
                                />
                            )}

                            {isFixedPrice && isOwner && priceProposal?.status === 'pending' && (
                                <LotSellerProposal
                                    t={t}
                                    priceProposal={priceProposal}
                                    respondSpinner={respondSpinner}
                                    onRespond={handleRespondPrice}
                                />
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
                buyNowPrice={isFixedPrice ? lot.currentPrice : lot.buyNowPrice!}
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