'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import { formatPrice, isUserAuth } from '@/lib/utils/common'
import { handleopenAuthModal } from '@/lib/utils/common'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/user-page/index.module.scss'
import VerificationBadge from '@/components/elements/VerificationBadge/VerificationBadge'

const EMOJIS = ['😠', '😕', '😐', '🙂', '😄']

const UserPage = () => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any
    const params = useParams()
    const currentUser = useUnit($user) as any

    const [userData, setUserData] = useState<any>(null)
    const [lots, setLots] = useState<any[]>([])
    const [spinner, setSpinner] = useState(true)
    const [followSpinner, setFollowSpinner] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [blockSpinner, setBlockSpinner] = useState(false)
    const [showReduceModal, setShowReduceModal] = useState(false)
    const [reduceType, setReduceType] = useState<'seller' | 'buyer'>('seller')
    const [reduceReason, setReduceReason] = useState('')
    const [reduceSpinner, setReduceSpinner] = useState(false)
    const [reducePercent, setReducePercent] = useState(20)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [blockReason, setBlockReason] = useState('')

    useEffect(() => {
        if (!params.id) return
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${params.id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setUserData(data.user)
                    setLots(data.activeLots)
                    setFollowersCount(data.user.followersCount)
                    if (currentUser?._id) {
                        setIsFollowing(
                            data.user.followers.some((f: any) => String(f) === String(currentUser._id))
                        )
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }
        fetchUser()
    }, [params.id, currentUser?._id])

    const handleFollow = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setFollowSpinner(true)
        try {
            const res = await fetch(`/api/users/${params.id}/follow`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setIsFollowing(data.isFollowing)
                setFollowersCount(data.followersCount)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setFollowSpinner(false)
        }
    }

    const handleBlock = async (reason: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setBlockSpinner(true)
        try {
            const res = await fetch(`/api/users/${params.id}/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ reason }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setUserData((prev: any) => ({
                    ...prev,
                    isBlocked: data.isBlocked,
                    blockReason: data.blockReason,
                }))
                setShowBlockModal(false)
                setBlockReason('')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setBlockSpinner(false)
        }
    }

    const handleReduceRating = async () => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setReduceSpinner(true)
        try {
            const res = await fetch(`/api/users/${params.id}/reduce-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    reason: reduceReason,
                    ratingType: reduceType,
                    percent: reducePercent,
                }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setShowReduceModal(false)
                setReduceReason('')
                const field = reduceType === 'seller' ? 'sellerRating' : 'buyerRating'
                setUserData((prev: any) => ({ ...prev, [field]: data.newRating }))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setReduceSpinner(false)
        }
    }

    if (spinner) {
        return (
            <main>
                <section style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                </section>
            </main>
        )
    }

    if (!userData) return null

    const isOwnProfile = String(currentUser?._id) === String(params.id)
    const isModerator = currentUser?.role === 'moderator' || currentUser?.role === 'admin'

    return (
        <main>
            <section className={styles.user_page}>
                <div className='container'>

                    {userData.isBlocked && (
                        <div className={styles.user_page__block_banner}>
                            <span className={styles.user_page__block_banner__icon}>🔒</span>
                            <div>
                                <p className={styles.user_page__block_banner__title}>
                                    Акаунт заблоковано
                                </p>
                                {userData.blockReason && (
                                    <p className={styles.user_page__block_banner__reason}>
                                        Причина: {userData.blockReason}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    <div className={styles.user_page__header}>
                        <div className={styles.user_page__avatar}>
                            <img src={userData.image || '/img/no-image.jpg'} alt={userData.name} />
                        </div>

                        <div className={styles.user_page__info}>
                            <span className={styles.user_page__badge}>RoyalTick Member</span>
                            <h1 className={styles.user_page__name}>{userData.name}</h1>
                            <VerificationBadge isVerified={!!userData.isVerified} />

                            <div className={styles.user_page__stats}>
                                <div className={styles.user_page__stat}>
                                    <span className={styles.user_page__stat_value}>{lots.length}</span>
                                    <span className={styles.user_page__stat_label}>{t.profile?.lots_count || 'Активні лоти'}</span>
                                </div>
                                <div className={styles.user_page__stat}>
                                    <span className={styles.user_page__stat_value}>{followersCount}</span>
                                    <span className={styles.user_page__stat_label}>{t.profile?.followers || 'Підписники'}</span>
                                </div>
                                <div className={styles.user_page__stat}>
                                    <span className={styles.user_page__stat_value}>{userData.followingCount}</span>
                                    <span className={styles.user_page__stat_label}>{t.profile?.following || 'Підписки'}</span>
                                </div>
                                <div className={styles.user_page__stat}>
                                    <span className={styles.user_page__stat_value}>
                                        ⭐ {(userData.sellerRating ?? 0).toFixed(1)}
                                        <span className={styles.user_page__stat_count}> ({userData.sellerRatingsCount ?? 0})</span>
                                    </span>
                                    <span className={styles.user_page__stat_label}>{t.profile?.seller_rating || 'Рейтинг продавця'}</span>
                                </div>
                                <div className={styles.user_page__stat}>
                                    <span className={styles.user_page__stat_value}>
                                        🛒 {(userData.buyerRating ?? 0).toFixed(1)}
                                        <span className={styles.user_page__stat_count}> ({userData.buyerRatingsCount ?? 0})</span>
                                    </span>
                                    <span className={styles.user_page__stat_label}>{t.profile?.buyer_rating || 'Рейтинг покупця'}</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.user_page__actions}>
                            {!isOwnProfile && !isModerator && (
                                <button
                                    className={`btn-reset ${styles.user_page__follow_btn} ${isFollowing ? styles.user_page__follow_btn_active : ''}`}
                                    onClick={handleFollow}
                                    disabled={followSpinner}
                                >
                                    {followSpinner
                                        ? <FontAwesomeIcon icon={faSpinner} spin />
                                        : isFollowing
                                            ? (t.profile?.unfollow || 'Відписатись')
                                            : (t.profile?.follow || 'Підписатись')
                                    }
                                </button>
                            )}

                            {isModerator && !isOwnProfile && (
                                <div className={styles.user_page__mod_actions}>
                                    <button
                                        className={`btn-reset ${styles.user_page__block_btn} ${userData.isBlocked ? styles.user_page__block_btn_blocked : ''}`}
                                        onClick={() => userData.isBlocked ? handleBlock('') : setShowBlockModal(true)}
                                        disabled={blockSpinner}
                                    >
                                        {blockSpinner
                                            ? <FontAwesomeIcon icon={faSpinner} spin />
                                            : userData.isBlocked ? '🔓 Розблокувати' : '🔒 Заблокувати'
                                        }
                                    </button>
                                    <button
                                        className={`btn-reset ${styles.user_page__reduce_btn}`}
                                        onClick={() => setShowReduceModal(true)}
                                    >
                                        📉 Знизити рейтинг
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {lots.length > 0 && (
                        <div className={styles.user_page__lots}>
                            <h2 className={styles.user_page__lots_title}>
                                {t.profile?.active_lots || 'Активні лоти'}
                            </h2>
                            <div className={styles.user_page__lots_scroll}>
                                {lots.map((lot) => (
                                    <div key={lot._id} className={styles.user_page__lots_slide}>
                                        <Link href={`/auction/${lot._id}`} className={styles.user_page__lot_link}>
                                            <div className={styles.user_page__lot_img}>
                                                <img src={lot.mainPhotoUrl || '/img/no-image.jpg'} alt={lot.title} />
                                            </div>
                                            <div className={styles.user_page__lot_info}>
                                                <h3 className={styles.user_page__lot_title}>{lot.title}</h3>
                                                <span className={styles.user_page__lot_price}>{formatPrice(lot.currentPrice)} ₴</span>
                                                <span className={styles.user_page__lot_bids}>
                                                    {t.auction?.bids_count}: {lot.bids.length}
                                                </span>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {userData.sellerReviews?.length > 0 && (
                        <div className={styles.user_page__reviews}>
                            <h2 className={styles.user_page__reviews_title}>
                                {t.profile?.reviews || 'Відгуки'} ({userData.sellerReviews.length})
                            </h2>
                            <div className={styles.user_page__reviews_list}>
                                {[...userData.sellerReviews].reverse().map((review: any, i: number) => (
                                    <div key={i} className={styles.user_page__review_item}>
                                        <span className={styles.user_page__review_emoji}>
                                            {EMOJIS[(review.rating ?? 1) - 1]}
                                        </span>
                                        <div className={styles.user_page__review_body}>
                                            <Link
                                                href={String(review.fromUserId) === String(currentUser?._id)
                                                    ? '/profile'
                                                    : `/user/${review.fromUserId}`
                                                }
                                                className={styles.user_page__review_from}
                                            >
                                                {review.fromUserName}
                                            </Link>
                                            <span className={styles.user_page__review_lot}>{review.lotTitle}</span>
                                            {review.comment && (
                                                <p className={styles.user_page__review_comment}>{review.comment}</p>
                                            )}
                                        </div>
                                        <span className={styles.user_page__review_date}>
                                            {new Date(review.createdAt).toLocaleDateString(
                                                lang === 'ua' ? 'uk-UA' : 'en-US',
                                                { day: '2-digit', month: '2-digit', year: 'numeric' }
                                            )}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </section>

            {showReduceModal && (
                <div className={styles.user_page__modal_overlay} onClick={() => setShowReduceModal(false)}>
                    <div className={styles.user_page__modal} onClick={e => e.stopPropagation()}>
                        <h3>📉 Знизити рейтинг</h3>
                        <p style={{ fontSize: 13, color: 'rgba(232,233,234,0.5)', margin: 0 }}>
                            Користувач: <strong style={{ color: '#e8e9ea' }}>{userData.name}</strong>
                        </p>
                        <select
                            value={reduceType}
                            onChange={e => setReduceType(e.target.value as 'seller' | 'buyer')}
                            className={styles.user_page__modal_select}
                        >
                            <option value='seller'>Як продавця</option>
                            <option value='buyer'>Як покупця</option>
                        </select>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            <label style={{ fontSize: 12, color: 'rgba(232,233,234,0.4)' }}>
                                Знизити на: <strong style={{ color: '#fbbf24' }}>{reducePercent}%</strong>
                            </label>
                            <input
                                type='range'
                                min={10}
                                max={50}
                                step={5}
                                value={reducePercent}
                                onChange={e => setReducePercent(Number(e.target.value))}
                                style={{ accentColor: '#fbbf24' }}
                            />
                        </div>
                        <textarea
                            className={styles.user_page__modal_textarea}
                            placeholder='Причина зниження рейтингу...'
                            value={reduceReason}
                            onChange={e => setReduceReason(e.target.value)}
                        />
                        <div className={styles.user_page__modal_btns}>
                            <button
                                className={`btn-reset ${styles.user_page__modal_cancel}`}
                                onClick={() => setShowReduceModal(false)}
                            >
                                Скасувати
                            </button>
                            <button
                                className={`btn-reset ${styles.user_page__modal_confirm}`}
                                onClick={handleReduceRating}
                                disabled={reduceSpinner || !reduceReason.trim()}
                            >
                                {reduceSpinner ? '...' : 'Підтвердити'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showBlockModal && (
                <div className={styles.user_page__modal_overlay} onClick={() => setShowBlockModal(false)}>
                    <div className={styles.user_page__modal} onClick={e => e.stopPropagation()}>
                        <h3>🔒 Заблокувати користувача</h3>
                        <p style={{ fontSize: 13, color: 'rgba(232,233,234,0.5)', margin: 0 }}>
                            <strong style={{ color: '#e8e9ea' }}>{userData.name}</strong> не зможе виставляти лоти та робити ставки.
                        </p>
                        <textarea
                            className={styles.user_page__modal_textarea}
                            placeholder='Причина блокування...'
                            value={blockReason}
                            onChange={e => setBlockReason(e.target.value)}
                        />
                        <div className={styles.user_page__modal_btns}>
                            <button
                                className={`btn-reset ${styles.user_page__modal_cancel}`}
                                onClick={() => setShowBlockModal(false)}
                            >
                                Скасувати
                            </button>
                            <button
                                className={`btn-reset`}
                                style={{
                                    padding: '9px 18px',
                                    borderRadius: 8,
                                    background: 'rgba(248,113,113,0.15)',
                                    border: '1px solid rgba(248,113,113,0.3)',
                                    color: '#f87171',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    cursor: blockSpinner || !blockReason.trim() ? 'not-allowed' : 'pointer',
                                    opacity: blockSpinner || !blockReason.trim() ? 0.4 : 1,
                                }}
                                onClick={() => handleBlock(blockReason)}
                                disabled={blockSpinner || !blockReason.trim()}
                            >
                                {blockSpinner ? '...' : 'Заблокувати'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default UserPage