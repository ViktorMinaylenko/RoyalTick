'use client'
import { useState } from 'react'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { IDeleteTopicProps, ITopic } from '@/types/community'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { useModeratorDelete } from '@/hooks/useModeratorDelete'
import ModeratorDeleteModal from './ModeratorDeleteModal'
import styles from '@/styles/community/index.module.scss'

const TopicItem = ({ topic, onDeleted }: IDeleteTopicProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community
    const user = useUnit($user) as any
    const isModerator = ['moderator', 'admin'].includes(user?.role)
    const [isHidden, setIsHidden] = useState(false)

    const { isModalOpen, isDeleting, openDeleteModal, closeDeleteModal, handleDelete } =
        useModeratorDelete(() => {
            setIsHidden(true)
            onDeleted?.(String(topic._id))
        })

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }
        )

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        openDeleteModal({
            type: 'topic',
            topicId: String(topic._id),
            topicTitle: topic.title,
        })
    }

    if (isHidden) return null

    return (
        <li className={styles.topic_item}>
            {isModerator && (
                <button
                    className={`btn-reset ${styles.topic_item__delete}`}
                    onClick={handleDeleteClick}
                    title='Видалити обговорення'
                >
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            )}
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
            <ModeratorDeleteModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                type='topic'
                title={topic.title}
            />
        </li>
    )
}

export default TopicItem