import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/community/index.module.scss'
import { IPropsTopicMessage } from '@/types/community'
import { isUserAuth } from '@/lib/utils/common'

const TopicMessage = ({
    msg, replies,
    topicId, topicTitle, topicUserId,
    userId, isModerator,
    t, formatDate,
    onReply, onDelete,
}: IPropsTopicMessage) => {
    const isMine = String(msg.userId) === String(userId)
    const isAuthor = String(msg.userId) === String(topicUserId)

    return (
        <div className={styles.topic__message_thread}>
            <div className={styles.topic__message}>
                <div className={styles.topic__message_avatar}>
                    <img src={msg.userImage || '/img/no-image.jpg'} alt={msg.userName} />
                </div>
                <div className={styles.topic__message_body}>
                    <div className={styles.topic__message_header}>
                        <Link
                            href={isMine ? '/profile' : `/user/${msg.userId}`}
                            className={styles.topic__message_author}
                        >
                            {msg.userName}
                        </Link>
                        {isAuthor && (
                            <span className={styles.topic__message_badge_author}>
                                {t.badge_author || 'Автор'}
                            </span>
                        )}
                        <span className={styles.topic__message_date}>
                            {formatDate(msg.createdAt)}
                        </span>
                        {isModerator && (
                            <button
                                className={`btn-reset ${styles.topic__message_delete_btn}`}
                                onClick={() => onDelete({
                                    type: 'message',
                                    topicId,
                                    msgId: String(msg._id),
                                    topicTitle,
                                })}
                                title={t.delete_message || 'Видалити коментар'}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                        )}
                    </div>
                    <p className={styles.topic__message_text}>{msg.text}</p>
                    {isUserAuth() && (
                        <button
                            className={`btn-reset ${styles.topic__message_reply_btn}`}
                            onClick={() => onReply(String(msg._id), msg.userName)}
                        >
                            ↩ {t.reply_to || 'Відповісти'}
                        </button>
                    )}
                </div>
            </div>

            {replies.length > 0 && (
                <div className={styles.topic__replies}>
                    {replies.map((reply) => {
                        const isReplyMine = String(reply.userId) === String(userId)
                        const isReplyAuthor = String(reply.userId) === String(topicUserId)

                        return (
                            <div key={String(reply._id)} className={styles.topic__reply_item}>
                                <div className={styles.topic__reply_item_avatar}>
                                    <img src={reply.userImage || '/img/no-image.jpg'} alt={reply.userName} />
                                </div>
                                <div className={styles.topic__message_body}>
                                    <div className={styles.topic__message_header}>
                                        <Link
                                            href={isReplyMine ? '/profile' : `/user/${reply.userId}`}
                                            className={styles.topic__message_author}
                                        >
                                            {reply.userName}
                                        </Link>
                                        {isReplyAuthor && (
                                            <span className={styles.topic__message_badge_author}>
                                                {t.badge_author || 'Автор'}
                                            </span>
                                        )}
                                        <span className={styles.topic__reply_mention}>
                                            ↩ {reply.replyToUserName}
                                        </span>
                                        <span className={styles.topic__message_date}>
                                            {formatDate(reply.createdAt)}
                                        </span>
                                        {isModerator && (
                                            <button
                                                className={`btn-reset ${styles.topic__message_delete_btn}`}
                                                onClick={() => onDelete({
                                                    type: 'message',
                                                    topicId,
                                                    msgId: String(reply._id),
                                                    topicTitle,
                                                })}
                                                title={t.delete_message || 'Видалити коментар'}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        )}
                                    </div>
                                    <p className={styles.topic__message_text}>{reply.text}</p>
                                    {isUserAuth() && (
                                        <button
                                            className={`btn-reset ${styles.topic__message_reply_btn}`}
                                            onClick={() => onReply(String(msg._id), msg.userName)}
                                        >
                                            ↩ {t.reply_to || 'Відповісти'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default TopicMessage