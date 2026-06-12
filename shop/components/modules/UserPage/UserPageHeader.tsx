import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/user-page/index.module.scss'
import VerificationBadge from '@/components/elements/VerificationBadge/VerificationBadge'
import { IPropsUserPageHeader } from '@/types/user'

const UserPageHeader = ({
    userData, lots, followersCount,
    isFollowing, followSpinner,
    isOwnProfile, isModerator, t,
    onFollow, onBlock, onShowBlockModal, onShowReduceModal,
    blockSpinner,
}: IPropsUserPageHeader) => (
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
                    onClick={onFollow}
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
                        onClick={() => userData.isBlocked ? onBlock() : onShowBlockModal()}
                        disabled={blockSpinner}
                    >
                        {blockSpinner
                            ? <FontAwesomeIcon icon={faSpinner} spin />
                            : userData.isBlocked ? '🔓 Розблокувати' : '🔒 Заблокувати'
                        }
                    </button>
                    <button
                        className={`btn-reset ${styles.user_page__reduce_btn}`}
                        onClick={onShowReduceModal}
                    >
                        📉 Знизити рейтинг
                    </button>
                </div>
            )}
        </div>
    </div>
)

export default UserPageHeader