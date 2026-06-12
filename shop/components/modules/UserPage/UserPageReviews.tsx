import Link from 'next/link'
import { formatReviewDate } from '@/lib/utils/common'
import styles from '@/styles/user-page/index.module.scss'
import { EMOJIS } from '@/constants/chat'
import { IPropsUserPageReviews } from '@/types/user'

const UserPageReviews = ({ reviews, currentUserId, lang, t }: IPropsUserPageReviews) => {
    if (!reviews?.length) return null

    return (
        <div className={styles.user_page__reviews}>
            <h2 className={styles.user_page__reviews_title}>
                {t.profile?.reviews || 'Відгуки'} ({reviews.length})
            </h2>
            <div className={styles.user_page__reviews_list}>
                {[...reviews].reverse().map((review: any, i: number) => (
                    <div key={i} className={styles.user_page__review_item}>
                        <span className={styles.user_page__review_emoji}>
                            {EMOJIS[(review.rating ?? 1) - 1]}
                        </span>
                        <div className={styles.user_page__review_body}>
                            <Link
                                href={String(review.fromUserId) === String(currentUserId)
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
                            {formatReviewDate(review.createdAt, lang)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserPageReviews