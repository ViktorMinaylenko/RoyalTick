'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { ITopic } from '@/types/community'
import Link from 'next/link'
import styles from '@/styles/community/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner, faTrash } from '@fortawesome/free-solid-svg-icons'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useModeratorDelete } from '@/hooks/useModeratorDelete'
import ModeratorDeleteModal from '@/components/modules/CommunityPage/ModeratorDeleteModal'

const TopicPage = () => {
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('topic')
    const params = useParams()
    const router = useRouter()
    const user = useUnit($user) as any
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const isModerator = ['moderator', 'admin'].includes(user?.role)

    const [topic, setTopic] = useState<ITopic | null>(null)
    const [spinner, setSpinner] = useState(true)
    const [text, setText] = useState('')
    const [sendSpinner, setSendSpinner] = useState(false)
    const [likeSpinner, setLikeSpinner] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const { isModalOpen, isDeleting, target, openDeleteModal, closeDeleteModal, handleDelete } =
        useModeratorDelete((data) => {
            if (data?.topic) {
                setTopic(data.topic)
            }
        })

    useEffect(() => {
        if (!params.id) return

        const fetchTopic = async () => {
            try {
                const res = await fetch(`/api/community/topics/${params.id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setTopic(data.topic)
                    setLikesCount(data.topic.likes?.length ?? 0)
                    if (user?._id) {
                        setIsLiked(
                            data.topic.likes?.some((l: any) => String(l) === String(user._id))
                        )

                        fetch(`/api/community/topics/${params.id}/view`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId: user._id }),
                        })
                            .then(r => r.json())
                            .then(d => {
                                if (d.views !== undefined) {
                                    setTopic((prev: any) =>
                                        prev ? { ...prev, views: d.views } : prev
                                    )
                                }
                            })
                            .catch(console.error)
                    }
                } else {
                    router.push('/community')
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchTopic()
    }, [params.id, user?._id])

    useEffect(() => {
        if (topic?.title) {
            const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
            if (lastCrumb) lastCrumb.textContent = topic.title
        }
    }, [topic?.title])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [topic?.messages?.length])

    const handleSend = async () => {
        if (!text.trim()) return
        if (!isUserAuth()) { handleopenAuthModal(); return }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSendSpinner(true)
        try {
            const res = await fetch(`/api/community/topics/${params.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    text,
                    replyToId: replyTo?.id || null,
                    replyToUserName: replyTo?.userName || null,
                }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setTopic(data.topic)
                setText('')
                setReplyTo(null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSendSpinner(false)
        }
    }

    const handleReply = (msgId: string, userName: string) => {
        setReplyTo({ id: msgId, userName })
        textareaRef.current?.focus()
    }

    const handleLike = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setLikeSpinner(true)
        try {
            const res = await fetch(`/api/community/topics/${params.id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setIsLiked(data.isLiked)
                setLikesCount(data.likesCount)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLikeSpinner(false)
        }
    }

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }
        )

    if (spinner) {
        return (
            <main>
                <section style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                </section>
            </main>
        )
    }

    if (!topic) return null

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.topic}>
                <div className='container'>

                    <div className={styles.topic__back}>
                        <Link href='/community' className={styles.topic__back_link}>
                            {t.back}
                        </Link>
                        <span className={styles.topic__category}>{topic.category}</span>
                    </div>

                    <div className={styles.topic__header}>
                        <h1 className={styles.topic__title}>{topic.title}</h1>
                        <div className={styles.topic__author}>
                            <div className={styles.topic__author_avatar}>
                                <img src={topic.userImage || '/img/no-image.jpg'} alt={topic.userName} />
                            </div>
                            <Link
                                href={String(topic.userId) === String(user?._id) ? '/profile' : `/user/${topic.userId}`}
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

                    <div className={styles.topic__stats}>
                        <span>👁 {topic.views}</span>
                        <span>💬 {topic.messages?.length ?? 0}</span>
                        <button
                            className={`btn-reset ${styles.topic__like_btn} ${isLiked ? styles.topic__like_btn_active : ''}`}
                            onClick={handleLike}
                            disabled={likeSpinner}
                        >
                            {likeSpinner ? '...' : `👍 ${likesCount}`}
                        </button>
                    </div>

                    <div className={styles.topic__messages}>
                        <h2 className={styles.topic__messages_title}>
                            {t.messages_title} {topic.messages?.length ?? 0}
                        </h2>

                        {topic.messages?.map((msg: any) => {
                            const isMine = String(msg.userId) === String(user?._id)
                            const isAuthor = String(msg.userId) === String(topic.userId)

                            return (
                                <div key={String(msg._id)} className={styles.topic__message}>
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
                                            {msg.replyToUserName && (
                                                <span className={styles.topic__message_reply_badge}>
                                                    ↩ {msg.replyToUserName}
                                                </span>
                                            )}
                                            <span className={styles.topic__message_date}>
                                                {formatDate(msg.createdAt)}
                                            </span>
                                            {isModerator && (
                                                <button
                                                    className={`btn-reset ${styles.topic__message_delete_btn}`}
                                                    onClick={() => openDeleteModal({
                                                        type: 'message',
                                                        topicId: String(params.id),
                                                        msgId: String(msg._id),
                                                        topicTitle: topic.title,
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
                                                onClick={() => handleReply(String(msg._id), msg.userName)}
                                            >
                                                ↩ {t.reply_to || 'Відповісти'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className={styles.topic__reply}>
                        {isUserAuth() ? (
                            <>
                                {replyTo && (
                                    <div className={styles.topic__reply_to}>
                                        <span>
                                            ↩ {t.replying_to || 'Відповідь'}:{' '}
                                            <strong>{replyTo.userName}</strong>
                                        </span>
                                        <button
                                            className='btn-reset'
                                            onClick={() => setReplyTo(null)}
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
                                    onChange={e => setText(e.target.value)}
                                />
                                <button
                                    className={`btn-reset ${styles.topic__reply_btn}`}
                                    onClick={handleSend}
                                    disabled={sendSpinner || !text.trim()}
                                >
                                    {sendSpinner
                                        ? <FontAwesomeIcon icon={faSpinner} spin />
                                        : t.reply_btn
                                    }
                                </button>
                            </>
                        ) : (
                            <p className={styles.topic__reply_hint}>
                                <button
                                    className='btn-reset'
                                    onClick={handleopenAuthModal}
                                    style={{ color: '#a78bfa', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    {t.login_hint_link}
                                </button>
                                {' '}{t.login_hint_text}
                            </p>
                        )}
                    </div>

                </div>
            </section>

            <ModeratorDeleteModal
                isOpen={isModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                type={target?.type || 'message'}
                title={target?.topicTitle}
            />
        </main>
    )
}

export default TopicPage