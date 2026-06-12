'use client'
import { useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { handleopenAuthModal, formatTopicDate, isUserAuth } from '@/lib/utils/common'
import Link from 'next/link'
import styles from '@/styles/community/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useModeratorDelete } from '@/hooks/useModeratorDelete'
import { useTopicData } from '@/hooks/useTopicData'
import { useTopicMessage } from '@/hooks/useTopicMessage'
import ModeratorDeleteModal from '@/components/modules/CommunityPage/ModeratorDeleteModal'
import TopicHeader from '@/components/modules/TopicPage/TopicHeader'
import TopicStats from '@/components/modules/TopicPage/TopicStats'
import TopicMessage from '@/components/modules/TopicPage/TopicMessage'
import TopicReplyForm from '@/components/modules/TopicPage/TopicReplyForm'

const TopicPage = () => {
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('topic')
    const params = useParams()
    const user = useUnit($user) as any
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const isModerator = ['moderator', 'admin'].includes(user?.role)

    const {
        topic, setTopic,
        spinner,
        isLiked, likesCount, likeSpinner,
        handleLike,
    } = useTopicData(String(params.id), user?._id)

    const {
        text, setText,
        sendSpinner,
        replyTo, setReplyTo,
        textareaRef,
        handleSend,
        handleReply,
    } = useTopicMessage(String(params.id), setTopic as any)

    const { isModalOpen, isDeleting, target, openDeleteModal, closeDeleteModal, handleDelete } =
        useModeratorDelete((data) => {
            if (data?.topic) setTopic(data.topic)
        })

    useEffect(() => {
        if (topic?.title) {
            const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
            if (lastCrumb) lastCrumb.textContent = topic.title
        }
    }, [topic?.title])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [topic?.messages?.length])

    const formatDate = (dateStr: string) => formatTopicDate(dateStr, lang)

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

                    <TopicHeader
                        topic={topic}
                        userId={user?._id}
                        lang={lang}
                        t={t}
                        formatDate={formatDate}
                    />

                    <TopicStats
                        topic={topic}
                        isLiked={isLiked}
                        likesCount={likesCount}
                        likeSpinner={likeSpinner}
                        onLike={handleLike}
                    />

                    <div className={styles.topic__messages}>
                        <h2 className={styles.topic__messages_title}>
                            {t.messages_title} {topic.messages?.length ?? 0}
                        </h2>

                        {topic.messages
                            ?.filter((msg: any) => !msg.replyToId)
                            .map((msg: any) => {
                                const replies = topic.messages?.filter(
                                    (r: any) => r.replyToId === String(msg._id)
                                ) || []

                                return (
                                    <TopicMessage
                                        key={String(msg._id)}
                                        msg={msg}
                                        replies={replies}
                                        topicId={String(params.id)}
                                        topicTitle={topic.title}
                                        topicUserId={String(topic.userId)}
                                        userId={user?._id}
                                        isModerator={isModerator}
                                        t={t}
                                        formatDate={formatDate}
                                        onReply={handleReply}
                                        onDelete={openDeleteModal}
                                    />
                                )
                            })}
                        <div ref={messagesEndRef} />
                    </div>

                    {isUserAuth() ? (
                        <TopicReplyForm
                            t={t}
                            text={text}
                            sendSpinner={sendSpinner}
                            replyTo={replyTo}
                            textareaRef={textareaRef}
                            onTextChange={setText}
                            onSend={handleSend}
                            onCancelReply={() => setReplyTo(null)}
                        />
                    ) : (
                        <div className={styles.topic__reply}>
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
                        </div>
                    )}

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