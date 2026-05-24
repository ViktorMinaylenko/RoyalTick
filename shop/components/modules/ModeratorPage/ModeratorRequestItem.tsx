import { useLang } from '@/hooks/useLang'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/moderator/index.module.scss'
import { IPropsModeratorItem } from '@/types/auction'

const ModeratorRequestItem = ({ chat, joiningId, onJoin }: IPropsModeratorItem) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).moderator

    return (
        <div className={styles.moderator__item}>
            <div className={styles.moderator__item_photo}>
                <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
            </div>
            <div className={styles.moderator__item_info}>
                <span className={styles.moderator__item_lot}>{chat.lotTitle}</span>
                <span className={styles.moderator__item_users}>
                    {chat.winnerName} ↔ {chat.ownerName}
                </span>
                <span className={styles.moderator__item_msgs}>
                    {chat.messages.length} {t?.messages_count || 'повідомлень'}
                </span>
            </div>
            <button
                className={`btn-reset ${styles.moderator__join_btn}`}
                onClick={() => onJoin(chat._id)}
                disabled={joiningId === chat._id}
            >
                {joiningId === chat._id
                    ? <FontAwesomeIcon icon={faSpinner} spin />
                    : t?.join || 'Приєднатись'
                }
            </button>
        </div>
    )
}

export default ModeratorRequestItem