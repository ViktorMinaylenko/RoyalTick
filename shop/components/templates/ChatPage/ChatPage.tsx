'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/chats/index.module.scss'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import Link from 'next/link'
import { IChat } from '@/types/lots'

const EMOJIS = ['😠', '😕', '😐', '🙂', '😄']

const ChatPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('chat')
    const user = useUnit($user) as any
    const params = useParams()
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [chat, setChat] = useState<IChat | null>(null)
    const [spinner, setSpinner] = useState(true)
    const [text, setText] = useState('')
    const [sendSpinner, setSendSpinner] = useState(false)
    const [completeSpinner, setCompleteSpinner] = useState(false)
    const [selectedRating, setSelectedRating] = useState(0)
    const [ratingComment, setRatingComment] = useState('')
    const [ratingSpinner, setRatingSpinner] = useState(false)
    const [inviteModSpinner, setInviteModSpinner] = useState(false)
    const [showInviteModModal, setShowInviteModModal] = useState(false)

    useEffect(() => {
        if (!params.id) return
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)

        const fetchChat = async () => {
            try {
                const res = await fetch(`/api/chats/${params.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) setChat(data.chat)
                else router.push('/chats')
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchChat()
        const interval = setInterval(fetchChat, 3000)
        return () => clearInterval(interval)
    }, [params.id])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat?.messages.length])

    const handleSend = async () => {
        if (!text.trim() || sendSpinner) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSendSpinner(true)
        try {
            const res = await fetch(`/api/chats/${params.id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ text }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setChat(data.chat)
                setText('')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSendSpinner(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleComplete = async () => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setCompleteSpinner(true)
        try {
            const res = await fetch(`/api/chats/${params.id}/complete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setCompleteSpinner(false)
        }
    }

    const handleRate = async (skip = false) => {
        if (!skip && !selectedRating) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setRatingSpinner(true)
        try {
            const res = await fetch(`/api/chats/${params.id}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    rating: skip ? 0 : selectedRating,
                    comment: skip ? '' : ratingComment,
                    skipped: skip,
                }),
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setRatingSpinner(false)
        }
    }

    const handleInviteModerator = async () => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setInviteModSpinner(true)
        try {
            const res = await fetch(`/api/chats/${params.id}/invite-moderator`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setInviteModSpinner(false)
        }
    }

    const formatTime = (dateStr: string) =>
        new Date(dateStr).toLocaleTimeString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { hour: '2-digit', minute: '2-digit' }
        )

    if (spinner) {
        return (
            <main>
                <section style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#7b2ff7' />
                </section>
            </main>
        )
    }

    if (!chat) return null

    const isOwner = String(chat.ownerId) === String(user?._id)
    const isParticipant = isOwner || String(chat.winnerId) === String(user?._id)
    const isModerator = user?.role === 'moderator' || user?.role === 'admin'
    const myCompleted = isOwner ? chat.dealCompletedByOwner : chat.dealCompletedByWinner
    const otherCompleted = isOwner ? chat.dealCompletedByWinner : chat.dealCompletedByOwner
    const alreadyRated = isOwner ? chat.ownerRatedBuyer : chat.winnerRatedSeller

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.chat}>
                <div className='container'>
                    <div className={styles.chat__inner}>

                        <div className={styles.chat__header}>
                            <div className={styles.chat__header_photo}>
                                <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
                            </div>
                            <div className={styles.chat__header_info}>
                                <span className={styles.chat__header_lot}>
                                    <Link href={`/auction/${chat.lotId}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        {chat.lotTitle}
                                    </Link>
                                </span>
                                <span className={styles.chat__header_sub}>
                                    {t.winner}:{' '}
                                    <Link
                                        href={String(chat.winnerId) === String(user?._id) ? '/profile' : `/user/${chat.winnerId}`}
                                        style={{ color: 'inherit' }}
                                    >
                                        {chat.winnerName}
                                    </Link>
                                    {' · '}
                                    {t.owner}:{' '}
                                    <Link
                                        href={String(chat.ownerId) === String(user?._id) ? '/profile' : `/user/${chat.ownerId}`}
                                        style={{ color: 'inherit' }}
                                    >
                                        {chat.ownerName}
                                    </Link>
                                </span>

                                {(chat as any).moderatorId ? (
                                    <span className={styles.chat__mod_active}>
                                        🛡️ Модератор: {(chat as any).moderatorName}
                                    </span>
                                ) : (chat as any).moderatorRequested ? (
                                    <span className={styles.chat__mod_pending}>
                                        🛡️ Очікує модератора...
                                    </span>
                                ) : null}
                            </div>

                            {isParticipant && !(chat as any).moderatorRequested && !(chat as any).moderatorId && (
                                <button
                                    className={`btn-reset ${styles.chat__invite_mod_btn}`}
                                    onClick={() => setShowInviteModModal(true)}
                                    title='Запросити модератора'
                                >
                                    🛡️
                                </button>
                            )}
                        </div>

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

                                const isMine = String(msg.senderId) === String(user?._id)
                                return (
                                    <div
                                        key={String(msg._id)}
                                        className={`${styles.chat__message} ${isMine ? styles.chat__message_mine : styles.chat__message_other}`}
                                    >
                                        {!isMine && (
                                            <span className={styles.chat__message_sender}>
                                                {msg.senderName}
                                            </span>
                                        )}
                                        <div className={styles.chat__message_bubble}>{msg.text}</div>
                                        <span className={styles.chat__message_time}>{formatTime(msg.createdAt)}</span>
                                    </div>
                                )
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {isParticipant && chat.status !== 'completed' && (
                            <div className={styles.chat__deal}>
                                <div className={styles.chat__deal_status}>
                                    <div className={styles.chat__deal_info}>
                                        <span>
                                            <span className={myCompleted ? styles.chat__deal_check : styles.chat__deal_pending}>
                                                {myCompleted ? '✓' : '○'}
                                            </span>
                                            {myCompleted ? t.deal?.you_completed : t.deal?.you_pending}
                                        </span>
                                        <span>
                                            <span className={otherCompleted ? styles.chat__deal_check : styles.chat__deal_pending}>
                                                {otherCompleted ? '✓' : '○'}
                                            </span>
                                            {otherCompleted ? t.deal?.other_completed : t.deal?.other_pending}
                                        </span>
                                    </div>
                                    {!myCompleted && (
                                        <button
                                            className={`btn-reset ${styles.chat__complete_btn}`}
                                            onClick={handleComplete}
                                            disabled={completeSpinner}
                                        >
                                            {completeSpinner ? '...' : t.deal?.complete_btn}
                                        </button>
                                    )}
                                </div>
                                <p className={styles.chat__hint}>⚠️ {t.deal?.hint}</p>
                            </div>
                        )}

                        {isParticipant && chat.status === 'completed' && (
                            <div className={styles.chat__deal}>
                                <div className={styles.chat__completed_badge}>
                                    ✅ {t.deal?.completed}
                                </div>

                                {!alreadyRated ? (
                                    <div className={styles.rating__block}>
                                        <p className={styles.rating__title}>
                                            {isOwner ? t.deal?.rate_buyer : t.deal?.rate_seller}
                                        </p>
                                        <p className={styles.rating__hint}>⭐ {t.deal?.rating_hint}</p>
                                        <div className={styles.rating__emojis}>
                                            {EMOJIS.map((emoji, i) => (
                                                <button
                                                    key={i}
                                                    className={`btn-reset ${styles.rating__emoji} ${selectedRating === i + 1 ? styles.rating__emoji_active : ''}`}
                                                    onClick={() => setSelectedRating(i + 1)}
                                                    title={`${i + 1}/5`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <textarea
                                            className={styles.rating__comment}
                                            placeholder={t.deal?.comment_placeholder}
                                            value={ratingComment}
                                            onChange={(e) => setRatingComment(e.target.value)}
                                            maxLength={300}
                                        />
                                        <div className={styles.rating__actions}>
                                            <button
                                                className={`btn-reset ${styles.rating__skip}`}
                                                onClick={() => handleRate(true)}
                                            >
                                                {t.deal?.skip_rating}
                                            </button>
                                            <button
                                                className={`btn-reset ${styles.rating__submit}`}
                                                onClick={() => handleRate(false)}
                                                disabled={!selectedRating || ratingSpinner}
                                            >
                                                {ratingSpinner ? '...' : t.deal?.submit_rating}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className={styles.rating__done}>✓ {t.deal?.already_rated}</p>
                                )}
                            </div>
                        )}

                        {isModerator && !isParticipant && (
                            <div className={styles.chat__mod_view}>
                                🛡️ Ви переглядаєте чат як модератор
                            </div>
                        )}

                        {(isParticipant || (isModerator && (chat as any).moderatorId && String((chat as any).moderatorId) === String(user?._id))) && (
                            <div className={styles.chat__input_area}>
                                <textarea
                                    className={styles.chat__input}
                                    placeholder={t.input_placeholder}
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <button
                                    className={`btn-reset ${styles.chat__send_btn}`}
                                    onClick={handleSend}
                                    disabled={sendSpinner || !text.trim()}
                                >
                                    {sendSpinner
                                        ? <FontAwesomeIcon icon={faSpinner} spin />
                                        : t.send
                                    }
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </section>
            {showInviteModModal && (
                <div className={styles.chat__confirm_overlay} onClick={() => setShowInviteModModal(false)}>
                    <div className={styles.chat__confirm_modal} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.chat__confirm_title}>🛡️ Викликати модератора?</h3>
                        <p className={styles.chat__confirm_text}>
                            Модератор отримає доступ до всієї історії чату. Він допоможе вирішити конфліктну ситуацію або зафіксувати порушення.
                        </p>
                        <div className={styles.chat__confirm_btns}>
                            <button className={`btn-reset ${styles.chat__confirm_cancel}`} onClick={() => setShowInviteModModal(false)}>
                                Скасувати
                            </button>
                            <button
                                className={`btn-reset ${styles.chat__confirm_delete}`}
                                style={{ background: 'rgba(123,47,247,0.15)', borderColor: 'rgba(123,47,247,0.3)', color: '#a78bfa' }}
                                onClick={async () => {
                                    setShowInviteModModal(false)
                                    await handleInviteModerator()
                                }}
                                disabled={inviteModSpinner}
                            >
                                {inviteModSpinner ? '...' : 'Викликати'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

export default ChatPage