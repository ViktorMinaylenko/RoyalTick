import { useLang } from '@/hooks/useLang'
import styles from '@/styles/chats/index.module.scss'
import { IProps } from '@/types/auction'

const InviteModeratorModal = ({ spinner, onClose, onConfirm }: IProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats

    return (
        <div className={styles.chat__confirm_overlay} onClick={onClose}>
            <div className={styles.chat__confirm_modal} onClick={e => e.stopPropagation()}>
                <h3 className={styles.chat__confirm_title}>
                    🛡️ {t.invite_mod_title || 'Викликати модератора?'}
                </h3>
                <p className={styles.chat__confirm_text}>
                    {t.invite_mod_text || 'Модератор отримає доступ до всієї історії чату. Він допоможе вирішити конфліктну ситуацію або зафіксувати порушення.'}
                </p>
                <div className={styles.chat__confirm_btns}>
                    <button
                        className={`btn-reset ${styles.chat__confirm_cancel}`}
                        onClick={onClose}
                    >
                        {t.invite_mod_cancel || 'Скасувати'}
                    </button>
                    <button
                        className={`btn-reset ${styles.chat__confirm_delete}`}
                        style={{ background: 'rgba(123,47,247,0.15)', borderColor: 'rgba(123,47,247,0.3)', color: '#a78bfa' }}
                        onClick={onConfirm}
                        disabled={spinner}
                    >
                        {spinner ? '...' : t.invite_mod_confirm || 'Викликати'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InviteModeratorModal