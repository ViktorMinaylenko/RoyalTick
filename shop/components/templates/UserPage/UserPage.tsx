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

    if (spinner) {
        return (
            <main>
                <section style={{ padding: '80px 0', display: 'flex', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#7b2ff7' />
                </section>
            </main>
        )
    }

    if (!userData) return null

    const isOwnProfile = String(currentUser?._id) === String(params.id)

    return (
        <main>
            <section className={styles.user_page}>
                <div className='container'>

                    <div className={styles.user_page__header}>
                        <div className={styles.user_page__avatar}>
                            <img
                                src={userData.image || '/img/no-image.jpg'}
                                alt={userData.name}
                            />
                        </div>
                        <div className={styles.user_page__info}>
                            <span className={styles.user_page__badge}>RoyalTick Member</span>
                            <h1 className={styles.user_page__name}>{userData.name}</h1>

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

                        {!isOwnProfile && (
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
        </main>
    )
}

export default UserPage