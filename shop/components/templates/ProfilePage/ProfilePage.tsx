'use client'

import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import ProfileAvatar from '@/components/modules/ProfilePage/ProfileAvatar'
import { $user } from '@/context/user/state'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useUnit } from 'effector-react'
import styles from '@/styles/profile/index.module.scss'
import ProfileName from '@/components/modules/ProfilePage/ProfileName'
import ProfileEmail from '@/components/modules/ProfilePage/ProfileEmail'
import { useLang } from '@/hooks/useLang'
import { deleteUser, deleteUserFx } from '@/context/profile'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useUserLogout } from '@/hooks/useLogout'
import { useEffect, useState } from 'react'
import { addOverflowHiddenToBody, formatPrice } from '@/lib/utils/common'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { loginCheck } from '@/context/user'
import { IReview } from '@/types/review'
import { IUserLot } from '@/types/lots'
import ProfileLotsSlider from '@/components/modules/ProfilePage/ProfileLotsSlider'
import { openVerificationModal } from '@/context/modals'
import VerificationBadge from '@/components/elements/VerificationBadge/VerificationBadge'

const EMOJIS = ['😠', '😕', '😐', '🙂', '😄']

const ProfilePage = () => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any
    const user = useUnit($user) as any
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('profile')
    usePageTitle('profile', user?.name || '')
    const deleteUserSpinner = useUnit(deleteUserFx.pending)
    const handleLogout = useUserLogout()
    const [lotsSpinner, setLotsSpinner] = useState(false)
    const [topupAmount, setTopupAmount] = useState('')
    const [topupSpinner, setTopupSpinner] = useState(false)
    const [reviewsTab, setReviewsTab] = useState<'seller' | 'buyer'>('seller')
    const [activeLots, setActiveLots] = useState<IUserLot[]>([])
    const [reservedLots, setReservedLots] = useState<IUserLot[]>([])
    const [completedLots, setCompletedLots] = useState<IUserLot[]>([])
    const [bidLots, setBidLots] = useState<IUserLot[]>([])
    const searchParams = useSearchParams()

    const handleOpenVerification = () => {
        addOverflowHiddenToBody()
        openVerificationModal()
    }

    useEffect(() => {
        const topupStatus = searchParams.get('topup')
        if (topupStatus === 'Approved') {
            const auth = localStorage.getItem('auth')
            if (auth) {
                const { accessToken } = JSON.parse(auth)
                setTimeout(() => loginCheck({ jwt: accessToken }), 500)
                toast.success(t.profile?.topup_success || 'Баланс успішно поповнено!')
            }
            window.history.replaceState({}, '', '/profile')
        }
    }, [searchParams])

    useEffect(() => {
        const fetchAllLots = async () => {
            const auth = localStorage.getItem('auth')
            if (!auth) return
            setLotsSpinner(true)
            const { accessToken } = JSON.parse(auth)
            const headers = { Authorization: `Bearer ${accessToken}` }
            try {
                const [activeRes, reservedRes, completedRes, bidsRes] = await Promise.all([
                    fetch('/api/auction/lots/user?status=active', { headers }),
                    fetch('/api/auction/lots/user?status=reserved', { headers }),
                    fetch('/api/auction/lots/user?status=completed', { headers }),
                    fetch('/api/auction/lots/user/bids', { headers }),
                ])
                const [activeData, reservedData, completedData, bidsData] = await Promise.all([
                    activeRes.json(),
                    reservedRes.json(),
                    completedRes.json(),
                    bidsRes.json(),
                ])
                if (activeData.status === 200) setActiveLots(activeData.lots)
                if (reservedData.status === 200) setReservedLots(reservedData.lots)
                if (completedData.status === 200) setCompletedLots(completedData.lots)
                if (bidsData.status === 200) setBidLots(bidsData.lots)
            } catch (error) {
                console.error(error)
            } finally {
                setLotsSpinner(false)
            }
        }
        fetchAllLots()
    }, [])

    if (!user?._id) return null

    const handleDeleteUser = () => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        deleteUser({ jwt: auth.accessToken, id: user._id, handleLogout })
    }

    const renderStars = (rating: number) =>
        Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={i < Math.floor(rating) ? styles.profile__star_full : styles.profile__star_empty}>★</span>
        ))

    const formatReviewDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { day: '2-digit', month: '2-digit', year: 'numeric' }
        )

    const handleTopup = async () => {
        const amount = Number(topupAmount)
        if (!amount || amount < 10) {
            toast.error(t.profile?.topup_min_error || 'Мінімальна сума 10 ₴')
            return
        }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setTopupSpinner(true)
        try {
            const res = await fetch('/api/payment/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.accessToken}` },
                body: JSON.stringify({ amount }),
            })
            const data = await res.json()
            if (data.result) {
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = 'https://secure.wayforpay.com/pay'
                form.acceptCharset = 'utf-8'
                Object.entries(data.result).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((v) => {
                            const input = document.createElement('input')
                            input.type = 'hidden'
                            input.name = key
                            input.value = String(v)
                            form.appendChild(input)
                        })
                    } else {
                        const input = document.createElement('input')
                        input.type = 'hidden'
                        input.name = key
                        input.value = String(value)
                        form.appendChild(input)
                    }
                })
                document.body.appendChild(form)
                form.submit()
            } else {
                toast.error(data.message || 'Помилка')
            }
        } catch (error) {
            console.error(error)
            toast.error(t.auction?.error_generic)
        } finally {
            setTopupSpinner(false)
        }
    }

    const currentReviews: IReview[] = reviewsTab === 'seller'
        ? (user?.sellerReviews ?? [])
        : (user?.buyerReviews ?? [])

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.profile}>
                <div className={`container ${styles.profile__container}`}>

                    <aside className={styles.profile__sidebar}>
                        <div className={styles.profile__sidebar_card}>
                            <div className={styles.profile__avatar_block}>
                                <ProfileAvatar />
                                <div className={styles.profile__sidebar_name}>{user.name}</div>
                                <div className={styles.profile__sidebar_email}>{user.email}</div>
                                <span className={styles.profile__sidebar_badge}>RoyalTick Member</span>
                            </div>

                            <div style={{ padding: '4px 0' }}>
                                <ProfileName />
                                <ProfileEmail />
                            </div>

                            <nav className={styles.profile__nav}>
                                <span className={`${styles.profile__nav_item} ${styles.profile__nav_item_active}`}>
                                    <span className={styles.profile__nav_item__icon}>📊</span>
                                    {t.profile?.overview || 'Огляд'}
                                </span>
                                <Link href='/auction' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>🔨</span>
                                    {t.main_menu?.auction}
                                </Link>
                                <Link href='/chats' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>💬</span>
                                    {t.breadcrumbs?.chats}
                                </Link>
                                <Link href='/favorites' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>♡</span>
                                    {t.breadcrumbs?.favorites}
                                </Link>
                                <Link href='/watched-products' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>👁</span>
                                    {t.breadcrumbs?.watched_products}
                                </Link>
                                {(user?.role === 'moderator' || user?.role === 'admin') && (
                                    <Link href='/moderator' className={styles.profile__nav_item}>
                                        <span className={styles.profile__nav_item__icon}>🛡️</span>
                                        Панель модератора
                                    </Link>
                                )}
                                <button
                                    className={`btn-reset ${styles.profile__nav_item} ${styles.profile__nav_item_danger}`}
                                    onClick={handleLogout}
                                >
                                    <span className={styles.profile__nav_item__icon}>→</span>
                                    {t.header?.logout}
                                </button>
                                <button
                                    className={`btn-reset ${styles.profile__nav_item} ${styles.profile__nav_item_danger}`}
                                    onClick={handleDeleteUser}
                                    disabled={deleteUserSpinner}
                                >
                                    <span className={styles.profile__nav_item__icon}>
                                        {deleteUserSpinner ? <FontAwesomeIcon icon={faSpinner} spin /> : '✕'}
                                    </span>
                                    {t.common?.delete_account}
                                </button>
                            </nav>
                        </div>
                    </aside>

                    <div className={styles.profile__main}>
                        {user?.isBlocked && (
                            <div className={styles.profile__block_banner}>
                                <span>🔒</span>
                                <div>
                                    <p className={styles.profile__block_banner__title}>Ваш акаунт заблоковано</p>
                                    {user?.blockReason && (
                                        <p className={styles.profile__block_banner__reason}>
                                            Причина: {user.blockReason}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className={styles.profile__banner}>
                            <div className={styles.profile__banner_left}>
                                <p className={styles.profile__banner_greeting}>{t.profile?.welcome || 'Вітаємо'}</p>
                                <h2 className={styles.profile__banner_name}>{user.name}</h2>
                                <div className={styles.profile__stars}>
                                    {renderStars(user?.sellerRating ?? 0)}
                                    <span className={styles.profile__rating_num}>{(user?.sellerRating ?? 0).toFixed(1)}</span>
                                </div>
                            </div>
                            <div className={styles.profile__banner_right}>
                                <span className={styles.profile__banner_balance_label}>{t.profile?.balance}</span>
                                <span className={styles.profile__banner_balance}>{formatPrice(user?.balance ?? 0)} ₴</span>
                                <div className={styles.profile__topup}>
                                    <input
                                        type='number'
                                        min={10}
                                        placeholder='Сума ₴'
                                        value={topupAmount}
                                        onChange={(e) => setTopupAmount(e.target.value)}
                                        className={styles.profile__topup__input}
                                    />
                                    <button
                                        className={`btn-reset ${styles.profile__topup__btn}`}
                                        onClick={handleTopup}
                                        disabled={topupSpinner}
                                    >
                                        {topupSpinner
                                            ? <FontAwesomeIcon icon={faSpinner} spin />
                                            : t.profile?.topup_btn || 'Поповнити'
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className={styles.profile__verification}>
                            <VerificationBadge isVerified={!!user.isVerified} />
                            {!user.isVerified && (
                                <button
                                    className={`btn-reset ${styles.profile__verification__btn}`}
                                    onClick={handleOpenVerification}
                                >
                                    Верифікувати акаунт
                                </button>
                            )}
                        </div>
                        <div className={styles.profile__stats}>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>👥</span>
                                <span className={styles.profile__stat_value}>{user?.followersCount ?? 0}</span>
                                <span className={styles.profile__stat_label}>
                                    {t.profile?.followers || 'Підписники'}
                                </span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>🔨</span>
                                <span className={styles.profile__stat_value}>{activeLots.length}</span>
                                <span className={styles.profile__stat_label}>{t.profile?.lots_count}</span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>⭐</span>
                                <span className={styles.profile__stat_value}>{(user?.sellerRating ?? 0).toFixed(1)}</span>
                                <span className={styles.profile__stat_label}>
                                    {t.profile?.seller_rating} ({user?.sellerRatingsCount ?? 0})
                                </span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>🛒</span>
                                <span className={styles.profile__stat_value}>{(user?.buyerRating ?? 0).toFixed(1)}</span>
                                <span className={styles.profile__stat_label}>
                                    {t.profile?.buyer_rating} ({user?.buyerRatingsCount ?? 0})
                                </span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>💰</span>
                                <span className={styles.profile__stat_value}>{formatPrice(user?.balance ?? 0)}</span>
                                <span className={styles.profile__stat_label}>{t.profile?.balance} ₴</span>
                            </div>
                        </div>

                        <div className={styles.profile__lots}>
                            <ProfileLotsSlider
                                title={t.profile?.active_lots || 'Активні лоти'}
                                lots={activeLots}
                                spinner={lotsSpinner}
                                allLink='/profile/lots/active'
                                emptyText={t.profile?.no_active_lots || 'Немає активних лотів'}
                            />

                            <ProfileLotsSlider
                                title={t.profile?.reserved_lots || 'Резерв'}
                                lots={reservedLots}
                                spinner={lotsSpinner}
                                allLink='/profile/lots/reserved'
                                emptyText={t.profile?.no_reserved_lots || 'Немає лотів в резерві'}
                            />

                            <ProfileLotsSlider
                                title={t.profile?.completed_lots || 'Завершені лоти'}
                                lots={completedLots}
                                spinner={lotsSpinner}
                                allLink='/profile/lots/completed'
                                emptyText={t.profile?.no_completed_lots || 'Немає завершених лотів'}
                            />

                            <ProfileLotsSlider
                                title={t.profile?.bid_lots || 'Участь у торгах'}
                                lots={bidLots}
                                spinner={lotsSpinner}
                                allLink='/profile/lots/bids'
                                emptyText={t.profile?.no_bid_lots || 'Ви ще не брали участі в торгах'}
                            />
                        </div>

                        <div className={styles.profile__reviews}>
                            <div className={styles.profile__reviews_header}>
                                <h2 className={styles.profile__reviews_title}>
                                    {t.profile?.reviews || 'Відгуки'}
                                </h2>
                                <div className={styles.profile__reviews_toggle}>
                                    <button
                                        className={`btn-reset ${styles.profile__reviews_toggle_btn} ${reviewsTab === 'seller' ? styles.profile__reviews_toggle_btn_active : ''}`}
                                        onClick={() => setReviewsTab('seller')}
                                    >
                                        {t.profile?.as_seller || 'Як продавець'} ({(user?.sellerReviews ?? []).length})
                                    </button>
                                    <button
                                        className={`btn-reset ${styles.profile__reviews_toggle_btn} ${reviewsTab === 'buyer' ? styles.profile__reviews_toggle_btn_active : ''}`}
                                        onClick={() => setReviewsTab('buyer')}
                                    >
                                        {t.profile?.as_buyer || 'Як покупець'} ({(user?.buyerReviews ?? []).length})
                                    </button>
                                </div>
                            </div>

                            {!currentReviews.length ? (
                                <div className={styles.profile__reviews_empty}>
                                    {t.profile?.no_reviews || 'Відгуків поки немає'}
                                </div>
                            ) : (
                                <ul className={`list-reset ${styles.profile__reviews_list}`}>
                                    {[...currentReviews].reverse().map((review, i) => (
                                        <li key={i} className={styles.profile__review_item}>
                                            <span className={styles.profile__review_emoji}>
                                                {EMOJIS[(review.rating ?? 1) - 1]}
                                            </span>
                                            <div className={styles.profile__review_body}>
                                                <Link
                                                    href={`/user/${review.fromUserId}`}
                                                    className={styles.profile__review_from}
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    {review.fromUserName}
                                                </Link>
                                                <span className={styles.profile__review_lot}>{review.lotTitle}</span>
                                                {review.comment && (
                                                    <p className={styles.profile__review_comment}>{review.comment}</p>
                                                )}
                                            </div>
                                            <span className={styles.profile__review_date}>
                                                {formatReviewDate(review.createdAt)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                    </div>
                </div>
            </section>
        </main>
    )
}

export default ProfilePage