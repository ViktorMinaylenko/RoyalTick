import { useLang } from '@/hooks/useLang'
import styles from '@/styles/chats/index.module.scss'
import { IChatMessagesProps } from '@/types/auction'

const ChatMessages = ({ chat, userId, messagesEndRef }: IChatMessagesProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { hour: '2-digit', minute: '2-digit' }
        )

    return (
        <div className={styles.chat__messages}>
            {!chat.messages.length && (
                <div className={styles.chat__empty_messages}>{t.no_messages}</div>
            )}
            {chat.messages.map((msg: any) => {
                if (msg.isSystem) {
                    return (
                        <div key={String(msg._id)} className={styles.chat__message_system}>
                            {msg.text}
                        </div>
                    )
                }

                const isMine = String(msg.senderId) === String(userId)
                return (
                    <div
                        key={String(msg._id)}
                        className={`${styles.chat__message} ${isMine ? styles.chat__message_mine : styles.chat__message_other}`}
                    >
                        {!isMine && (
                            <span className={styles.chat__message_sender}>{msg.senderName}</span>
                        )}
                        <div className={styles.chat__message_bubble}>{msg.text}</div>
                        <span className={styles.chat__message_time}>{formatTime(msg.createdAt)}</span>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}

export default ChatMessages