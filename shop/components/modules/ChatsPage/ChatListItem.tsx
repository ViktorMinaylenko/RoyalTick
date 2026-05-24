import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { useChats } from '@/hooks/useChats'
import styles from '@/styles/chats/index.module.scss'
import { IPropsChatListItem } from '@/types/auction'

const ChatListItem = ({ chat, userId, onDeleteClick }: IPropsChatListItem) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getUnreadCount, getLastMessage, formatDate } = useChats(userId)

    const isOwner = String(chat.ownerId) === String(userId)
    const unread = getUnreadCount(chat)
    const lastMsg = getLastMessage(chat)
    const lastDate = chat.messages.length
        ? formatDate(chat.messages[chat.messages.length - 1].createdAt)
        : formatDate(chat.createdAt)

    return (
        <li style={{ position: 'relative' }}>
            <Link href={`/chats/${chat._id}`} className={styles.chats__item}>
                <div className={styles.chats__item_photo}>
                    <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
                </div>
                <div className={styles.chats__item_info}>
                    <span className={styles.chats__item_role}>
                        {isOwner ? t.owner : t.winner}
                    </span>
                    <span className={styles.chats__item_lot}>{chat.lotTitle}</span>
                    {lastMsg && (
                        <span className={styles.chats__item_last}>{lastMsg}</span>
                    )}
                </div>
                <div className={styles.chats__item_meta}>
                    <span className={styles.chats__item_date}>{lastDate}</span>
                    {unread > 0 && (
                        <span className={styles.chats__item_badge}>
                            {unread > 9 ? '9+' : unread}
                        </span>
                    )}
                </div>
            </Link>
            <button
                className={`btn-reset ${styles.chats__delete_btn}`}
                onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDeleteClick(chat._id, chat.lotTitle)
                }}
                title={t.delete_chat || 'Видалити чат'}
            >
                ×
            </button>
        </li>
    )
}

export default ChatListItem