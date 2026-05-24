import { useLang } from '@/hooks/useLang'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import Link from 'next/link'
import styles from '@/styles/auction/index.module.scss'
import { ILotCommentsProps } from '@/types/auction'

const LotComments = ({
    comments, commentText, commentSpinner,
    userId, onTextChange, onSubmit,
}: ILotCommentsProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
        })

    return (
        <div className={styles.lot_page__comments}>
            <div className={styles.lot_page__comments__header}>
                <h2>{t.comments_title || 'Коментарі'}</h2>
                <span>{comments.length}</span>
            </div>

            {isUserAuth() ? (
                <div className={styles.lot_page__comments__form}>
                    <textarea
                        className={styles.lot_page__comments__textarea}
                        placeholder={t.comment_placeholder || 'Написати коментар...'}
                        value={commentText}
                        onChange={(e) => onTextChange(e.target.value)}
                    />
                    <button
                        className={`btn-reset ${styles.lot_page__comments__submit}`}
                        onClick={onSubmit}
                        disabled={commentSpinner || !commentText.trim()}
                    >
                        {commentSpinner ? '...' : t.comment_submit || 'Надіслати'}
                    </button>
                </div>
            ) : (
                <p className={styles.lot_page__comments__login_hint}>
                    <a onClick={handleopenAuthModal}>
                        {t.comment_login_hint || 'Увійдіть'}
                    </a>
                    {' '}{t.comment_login_hint_text || 'щоб залишити коментар'}
                </p>
            )}

            <div className={styles.lot_page__comments__list}>
                {[...comments].reverse().map((comment: any) => (
                    <div key={String(comment._id)} className={styles.lot_page__comments__item}>
                        <div className={styles.lot_page__comments__meta}>
                            {comment.role === 'seller' && (
                                <span className={`${styles.lot_page__comments__badge} ${styles.lot_page__comments__badge_seller}`}>
                                    {t.comment_role_seller || 'Продавець'}
                                </span>
                            )}
                            {comment.role === 'buyer' && (
                                <span className={`${styles.lot_page__comments__badge} ${styles.lot_page__comments__badge_buyer}`}>
                                    {t.comment_role_buyer || 'Покупець'}
                                </span>
                            )}
                            <Link
                                href={String(comment.userId) === String(userId) ? '/profile' : `/user/${comment.userId}`}
                                className={styles.lot_page__comments__username}
                            >
                                {comment.userName}
                            </Link>
                            <span className={styles.lot_page__comments__date}>
                                {formatDate(comment.createdAt)}
                            </span>
                        </div>
                        <p className={styles.lot_page__comments__text}>{comment.text}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LotComments