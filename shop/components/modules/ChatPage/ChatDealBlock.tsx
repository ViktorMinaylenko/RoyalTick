import { useLang } from '@/hooks/useLang'
import { EMOJIS } from '@/constants/chat'
import styles from '@/styles/chats/index.module.scss'
import { IChatDealBlockProps } from '@/types/auction'

const ChatDealBlock = ({
    chat, isOwner,
    completeSpinner, ratingSpinner,
    selectedRating, ratingComment,
    onSetRating, onSetComment,
    onComplete, onRate,
}: IChatDealBlockProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats

    const myCompleted = isOwner ? chat.dealCompletedByOwner : chat.dealCompletedByWinner
    const otherCompleted = isOwner ? chat.dealCompletedByWinner : chat.dealCompletedByOwner
    const alreadyRated = isOwner ? chat.ownerRatedBuyer : chat.winnerRatedSeller

    if (chat.status !== 'completed') {
        return (
            <div className={styles.chat__deal}>
                <div className={styles.chat__deal_status}>
                    <div className={styles.chat__deal_info}>
                        <span>
                            <span className={myCompleted ? styles.chat__deal_check : styles.chat__deal_pending}>
                                {myCompleted ? '✓' : '○'}
                            </span>
                            {myCompleted ? t.deal?.you_completed : t.deal?.you_pending}
                        </span>
                        <span>
                            <span className={otherCompleted ? styles.chat__deal_check : styles.chat__deal_pending}>
                                {otherCompleted ? '✓' : '○'}
                            </span>
                            {otherCompleted ? t.deal?.other_completed : t.deal?.other_pending}
                        </span>
                    </div>
                    {!myCompleted && (
                        <button
                            className={`btn-reset ${styles.chat__complete_btn}`}
                            onClick={onComplete}
                            disabled={completeSpinner}
                        >
                            {completeSpinner ? '...' : t.deal?.complete_btn}
                        </button>
                    )}
                </div>
                <p className={styles.chat__hint}>⚠️ {t.deal?.hint}</p>
            </div>
        )
    }

    return (
        <div className={styles.chat__deal}>
            <div className={styles.chat__completed_badge}>
                ✅ {t.deal?.completed}
            </div>
            {!alreadyRated ? (
                <div className={styles.rating__block}>
                    <p className={styles.rating__title}>
                        {isOwner ? t.deal?.rate_buyer : t.deal?.rate_seller}
                    </p>
                    <p className={styles.rating__hint}>⭐ {t.deal?.rating_hint}</p>
                    <div className={styles.rating__emojis}>
                        {EMOJIS.map((emoji, i) => (
                            <button
                                key={i}
                                className={`btn-reset ${styles.rating__emoji} ${selectedRating === i + 1 ? styles.rating__emoji_active : ''}`}
                                onClick={() => onSetRating(i + 1)}
                                title={`${i + 1}/5`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                    <textarea
                        className={styles.rating__comment}
                        placeholder={t.deal?.comment_placeholder}
                        value={ratingComment}
                        onChange={(e) => onSetComment(e.target.value)}
                        maxLength={300}
                    />
                    <div className={styles.rating__actions}>
                        <button
                            className={`btn-reset ${styles.rating__skip}`}
                            onClick={() => onRate(true)}
                        >
                            {t.deal?.skip_rating}
                        </button>
                        <button
                            className={`btn-reset ${styles.rating__submit}`}
                            onClick={() => onRate(false)}
                            disabled={!selectedRating || ratingSpinner}
                        >
                            {ratingSpinner ? '...' : t.deal?.submit_rating}
                        </button>
                    </div>
                </div>
            ) : (
                <p className={styles.rating__done}>✓ {t.deal?.already_rated}</p>
            )}
        </div>
    )
}

export default ChatDealBlock