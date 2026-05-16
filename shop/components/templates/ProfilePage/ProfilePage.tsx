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
import { formatPrice } from '@/lib/utils/common'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useSearchParams } from 'next/navigation'
import { loginCheck } from '@/context/user'

interface IUserLot {
    _id: string
    title: string
    mainPhotoUrl: string
    currentPrice: number
    endDate: string
    status: string
    bids: unknown[]
}

const ProfilePage = () => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any
    const user = useUnit($user) as any
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('profile')
    usePageTitle('profile', user?.name || '')
    const deleteUserSpinner = useUnit(deleteUserFx.pending)
    const handleLogout = useUserLogout()
    const [userLots, setUserLots] = useState<IUserLot[]>([])
    const [lotsSpinner, setLotsSpinner] = useState(false)
    const [topupAmount, setTopupAmount] = useState('')
    const [topupSpinner, setTopupSpinner] = useState(false)
    const searchParams = useSearchParams()

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
        const fetchUserLots = async () => {
            const auth = localStorage.getItem('auth')
            if (!auth) return
            setLotsSpinner(true)
            try {
                const { accessToken } = JSON.parse(auth)
                const res = await fetch('/api/auction/lots/user', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) setUserLots(data.lots)
            } catch (error) {
                console.error(error)
            } finally {
                setLotsSpinner(false)
            }
        }
        fetchUserLots()
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
                                <Link href='/favorites' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>♡</span>
                                    {t.breadcrumbs?.favorites}
                                </Link>
                                <Link href='/watched-products' className={styles.profile__nav_item}>
                                    <span className={styles.profile__nav_item__icon}>👁</span>
                                    {t.breadcrumbs?.watched_products}
                                </Link>
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

                        <div className={styles.profile__banner}>
                            <div className={styles.profile__banner_left}>
                                <p className={styles.profile__banner_greeting}>{t.profile?.welcome || 'Вітаємо'}</p>
                                <h2 className={styles.profile__banner_name}>{user.name}</h2>
                                <div className={styles.profile__stars}>
                                    {renderStars(user?.rating ?? 0)}
                                    <span className={styles.profile__rating_num}>{(user?.rating ?? 0).toFixed(1)}</span>
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

                        <div className={styles.profile__stats}>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>🔨</span>
                                <span className={styles.profile__stat_value}>{userLots.length}</span>
                                <span className={styles.profile__stat_label}>{t.profile?.lots_count}</span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>⭐</span>
                                <span className={styles.profile__stat_value}>{(user?.rating ?? 0).toFixed(1)}</span>
                                <span className={styles.profile__stat_label}>{t.profile?.rating}</span>
                            </div>
                            <div className={styles.profile__stat_card}>
                                <span className={styles.profile__stat_icon}>💰</span>
                                <span className={styles.profile__stat_value}>{formatPrice(user?.balance ?? 0)}</span>
                                <span className={styles.profile__stat_label}>{t.profile?.balance} ₴</span>
                            </div>
                        </div>

                        <div className={styles.profile__lots}>
                            <div className={styles.profile__lots__header}>
                                <h2 className={styles.profile__lots__title}>{t.profile?.my_lots}</h2>
                                <Link href='/auction' style={{ fontSize: 13, color: '#52b788' }}>
                                    {t.common?.all_link} →
                                </Link>
                            </div>

                            {lotsSpinner && (
                                <div className={styles.profile__lots__spinner}>
                                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#52b788' />
                                </div>
                            )}

                            {!lotsSpinner && !userLots.length && (
                                <p className={styles.profile__lots__empty}>{t.profile?.no_lots}</p>
                            )}

                            {!lotsSpinner && !!userLots.length && (
                                <ul className={`list-reset ${styles.profile__lots__list}`}>
                                    {userLots.map((lot) => (
                                        <li key={lot._id} className={styles.profile__lots__item}>
                                            <Link href={`/auction/${lot._id}`} className={styles.profile__lots__item__link}>
                                                <div className={styles.profile__lots__item__img}>
                                                    <img src={lot.mainPhotoUrl || '/img/no-image.jpg'} alt={lot.title} />
                                                    <span className={`${styles.profile__lots__item__status} ${lot.status === 'active' ? styles.profile__lots__item__status_active : styles.profile__lots__item__status_ended}`}>
                                                        {lot.status === 'active' ? t.profile?.lot_active : t.profile?.lot_ended}
                                                    </span>
                                                </div>
                                                <div className={styles.profile__lots__item__info}>
                                                    <h3 className={styles.profile__lots__item__title}>{lot.title}</h3>
                                                    <span className={styles.profile__lots__item__price}>{formatPrice(lot.currentPrice)} ₴</span>
                                                    <span className={styles.profile__lots__item__bids}>{t.auction?.bids_count}: {lot.bids.length}</span>
                                                    <span className={styles.profile__lots__item__end}>
                                                        {t.auction?.end_date}: {new Date(lot.endDate).toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US')}
                                                    </span>
                                                </div>
                                            </Link>
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