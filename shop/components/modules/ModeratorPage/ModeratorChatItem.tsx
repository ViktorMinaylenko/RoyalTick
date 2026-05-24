import Link from 'next/link'
import styles from '@/styles/moderator/index.module.scss'
import { IPropsModeratorChatItem } from '@/types/auction'


const ModeratorChatItem = ({ chat, onDeleteClick }: IPropsModeratorChatItem) => (
    <div className={styles.moderator__item} style={{ position: 'relative' }}>
        <Link
            href={`/chats/${chat._id}`}
            style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}
        >
            <div className={styles.moderator__item_photo}>
                <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
            </div>
            <div className={styles.moderator__item_info}>
                <span className={styles.moderator__item_lot}>{chat.lotTitle}</span>
                <span className={styles.moderator__item_users}>
                    {chat.winnerName} ↔ {chat.ownerName}
                </span>
            </div>
        </Link>
        <button
            className={`btn-reset ${styles.moderator__delete_btn}`}
            onClick={() => onDeleteClick(chat._id, chat.lotTitle)}
        >
            ×
        </button>
    </div>
)

export default ModeratorChatItem