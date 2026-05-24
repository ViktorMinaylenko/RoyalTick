import { useLang } from '@/hooks/useLang'
import styles from '@/styles/chats/index.module.scss'
import { IPropsDeleteChat } from '@/types/auction'



const DeleteChatModal = ({ title, deletingId, chatId, onClose, onConfirm }: IPropsDeleteChat) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats

    return (
        <div className={styles.chats__confirm_overlay} onClick={onClose}>
            <div className={styles.chats__confirm_modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.chats__confirm_title}>
                    {t.delete_confirm_title || 'Видалити чат?'}
                </h3>
                <p className={styles.chats__confirm_text}>
                    {t.delete_confirm_text_1 || 'Чат по лоту'}{' '}
                    <strong>«{title}»</strong>{' '}
                    {t.delete_confirm_text_2 || 'буде приховано. Він з\'явиться знову якщо співрозмовник напише повідомлення.'}
                </p>
                <div className={styles.chats__confirm_btns}>
                    <button
                        className={`btn-reset ${styles.chats__confirm_cancel}`}
                        onClick={onClose}
                    >
                        {t.delete_cancel || 'Скасувати'}
                    </button>
                    <button
                        className={`btn-reset ${styles.chats__confirm_delete}`}
                        onClick={onConfirm}
                        disabled={deletingId === chatId}
                    >
                        {deletingId === chatId ? '...' : t.delete_confirm || 'Видалити'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteChatModal