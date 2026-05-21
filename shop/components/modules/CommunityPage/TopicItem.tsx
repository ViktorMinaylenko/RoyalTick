import { ITopic } from '@/types/community'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import styles from '@/styles/community/index.module.scss'

const TopicItem = ({ topic }: { topic: ITopic }) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }
        )

    return (
        <li className={styles.topic_item}>
            <Link href={`/community/${topic._id}`} className={styles.topic_item__link}>
                <div className={styles.topic_item__meta}>
                    <div className={styles.topic_item__avatar}>
                        <img src={topic.userImage || '/img/no-image.jpg'} alt={topic.userName} />
                    </div>
                    <span className={styles.topic_item__author}>{topic.userName}</span>
                    <span className={styles.topic_item__date}>{formatDate(topic.createdAt)}</span>
                    {topic.messagesCount === 0 && (
                        <span className={styles.topic_item__new}>{t.new_badge}</span>
                    )}
                </div>

                <h3 className={styles.topic_item__title}>{topic.title}</h3>

                {topic.tags?.length > 0 && (
                    <div className={styles.topic_item__tags}>
                        {topic.tags.map((tag, i) => (
                            <span key={i} className={styles.topic_item__tag}>{tag}</span>
                        ))}
                    </div>
                )}

                <div className={styles.topic_item__stats}>
                    <span>👁 {topic.views}</span>
                    <span>💬 {topic.messagesCount}</span>
                    <span>👍 {topic.likes?.length ?? 0}</span>
                </div>
            </Link>
        </li>
    )
}

export default TopicItem