import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/community/index.module.scss'
import { IPropsReplyForm } from '@/types/community'

const TopicReplyForm = ({
    t, text, sendSpinner,
    replyTo, textareaRef,
    onTextChange, onSend, onCancelReply,
}: IPropsReplyForm) => (
    <div className={styles.topic__reply}>
        <>
            {replyTo && (
                <div className={styles.topic__reply_to}>
                    <span>
                        ↩ {t.replying_to || 'Відповідь'}:{' '}
                        <strong>{replyTo.userName}</strong>
                    </span>
                    <button
                        className='btn-reset'
                        onClick={onCancelReply}
                        style={{ marginLeft: 8, opacity: 0.5, cursor: 'pointer', fontSize: 12 }}
                    >
                        ✕
                    </button>
                </div>
            )}
            <textarea
                ref={textareaRef}
                className={styles.topic__reply_input}
                placeholder={t.reply_placeholder}
                value={text}
                onChange={e => onTextChange(e.target.value)}
            />
            <button
                className={`btn-reset ${styles.topic__reply_btn}`}
                onClick={onSend}
                disabled={sendSpinner || !text.trim()}
            >
                {sendSpinner
                    ? <FontAwesomeIcon icon={faSpinner} spin />
                    : t.reply_btn
                }
            </button>
        </>
    </div>
)

export default TopicReplyForm