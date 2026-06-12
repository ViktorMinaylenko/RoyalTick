import Link from 'next/link'
import styles from '@/styles/community/index.module.scss'
import { IPropsTopicHeader } from '@/types/community'

const TopicHeader = ({ topic, userId, formatDate, t }: IPropsTopicHeader) => (
    <>
        <div className={styles.topic__header}>
            <h1 className={styles.topic__title}>{topic.title}</h1>
            <div className={styles.topic__author}>
                <div className={styles.topic__author_avatar}>
                    <img src={topic.userImage || '/img/no-image.jpg'} alt={topic.userName} />
                </div>
                <Link
                    href={String(topic.userId) === String(userId) ? '/profile' : `/user/${topic.userId}`}
                    className={styles.topic__author_name}
                >
                    {topic.userName}
                </Link>
                <span className={styles.topic__author_date}>{formatDate(topic.createdAt)}</span>
            </div>
        </div>

        <div className={styles.topic__body}>
            <p>{topic.body}</p>
        </div>

        {(topic as any).photoUrls?.length > 0 && (
            <div className={styles.topic__photos}>
                {(topic as any).photoUrls.map((url: string, i: number) => (
                    <div key={i} className={styles.topic__photo}>
                        <img src={url} alt={`photo-${i}`} />
                    </div>
                ))}
            </div>
        )}

        {topic.tags?.length > 0 && (
            <div className={styles.topic__tags}>
                <span className={styles.topic__tags_label}>{t.tags_label}</span>
                {topic.tags.map((tag, i) => (
                    <span key={i} className={styles.topic__tag}>{tag}</span>
                ))}
            </div>
        )}
    </>
)

export default TopicHeader