import { useLang } from '@/hooks/useLang'
import styles from '@/styles/moderator/index.module.scss'
import { IPropsDeleteChatModal } from '@/types/auction'


const DeleteModeratorChatModal = ({ title, chatId, deletingId, onClose, onConfirm }: IPropsDeleteChatModal) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).moderator

    return (
        <div className={styles.moderator__overlay} onClick={onClose}>
            <div className={styles.moderator__confirm} onClick={e => e.stopPropagation()}>
                <h3>{t?.delete_title || 'Видалити чат?'}</h3>
                <p>«{title}»</p>
                <div className={styles.moderator__confirm_btns}>
                    <button
                        className={`btn-reset ${styles.moderator__cancel_btn}`}
                        onClick={onClose}
                    >
                        {t?.cancel || 'Скасувати'}
                    </button>
                    <button
                        className={`btn-reset ${styles.moderator__confirm_btn}`}
                        onClick={onConfirm}
                        disabled={deletingId === chatId}
                    >
                        {deletingId === chatId ? '...' : t?.delete || 'Видалити'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteModeratorChatModal