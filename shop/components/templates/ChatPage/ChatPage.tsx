'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/chats/index.module.scss'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import Link from 'next/link'
import { IChat } from '@/types/lots'
import { useChat } from '@/hooks/useChat'
import { useChatData } from '@/hooks/useChatData'
import ChatMessages from '@/components/modules/ChatPage/ChatMessages'
import ChatDealBlock from '@/components/modules/ChatPage/ChatDealBlock'
import InviteModeratorModal from '@/components/modules/ChatPage/InviteModeratorModal'

const ChatPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('chat')
    const user = useUnit($user) as any
    const params = useParams()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [showInviteModModal, setShowInviteModModal] = useState(false)

    const { chat, setChat, spinner } = useChatData(String(params.id))

    const {
        text, setText,
        sendSpinner, completeSpinner, ratingSpinner, inviteModSpinner,
        selectedRating, setSelectedRating,
        ratingComment, setRatingComment,
        handleSend, handleKeyDown, handleComplete, handleRate, handleInviteModerator,
    } = useChat(String(params.id), setChat as (chat: IChat) => void)

    useEffect(() => {
        if (chat?.lotTitle) {
            const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
            if (lastCrumb) lastCrumb.textContent = chat.lotTitle
        }
    }, [chat?.lotTitle])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [chat?.messages.length])

    if (spinner) {
        return (
            <main>
                <section style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}>
                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                </section>
            </main>
        )
    }

    if (!chat) return null

    const isOwner = String(chat.ownerId) === String(user?._id)
    const isParticipant = isOwner || String(chat.winnerId) === String(user?._id)
    const isModerator = user?.role === 'moderator' || user?.role === 'admin'

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
                                    <Link href={String(chat.winnerId) === String(user?._id) ? '/profile' : `/user/${chat.winnerId}`} style={{ color: 'inherit' }}>
                                        {chat.winnerName}
                                    </Link>
                                    {' · '}
                                    {t.owner}:{' '}
                                    <Link href={String(chat.ownerId) === String(user?._id) ? '/profile' : `/user/${chat.ownerId}`} style={{ color: 'inherit' }}>
                                        {chat.ownerName}
                                    </Link>
                                </span>
                                {(chat as any).moderatorId ? (
                                    <span className={styles.chat__mod_active}>
                                        🛡️ {t.moderator || 'Модератор'}: {(chat as any).moderatorName}
                                    </span>
                                ) : (chat as any).moderatorRequested ? (
                                    <span className={styles.chat__mod_pending}>
                                        🛡️ {t.mod_pending || 'Очікує модератора...'}
                                    </span>
                                ) : null}
                            </div>

                            {isParticipant && !(chat as any).moderatorRequested && !(chat as any).moderatorId && (
                                <button
                                    className={`btn-reset ${styles.chat__invite_mod_btn}`}
                                    onClick={() => setShowInviteModModal(true)}
                                    title={t.invite_mod_title || 'Запросити модератора'}
                                >
                                    🛡️
                                </button>
                            )}
                        </div>

                        <ChatMessages
                            chat={chat}
                            userId={String(user?._id)}
                            messagesEndRef={messagesEndRef}
                        />

                        {isParticipant && (
                            <ChatDealBlock
                                chat={chat}
                                isOwner={isOwner}
                                completeSpinner={completeSpinner}
                                ratingSpinner={ratingSpinner}
                                selectedRating={selectedRating}
                                ratingComment={ratingComment}
                                onSetRating={setSelectedRating}
                                onSetComment={setRatingComment}
                                onComplete={handleComplete}
                                onRate={handleRate}
                            />
                        )}

                        {isModerator && !isParticipant && (
                            <div className={styles.chat__mod_view}>
                                🛡️ {t.mod_view || 'Ви переглядаєте чат як модератор'}
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
                <InviteModeratorModal
                    spinner={inviteModSpinner}
                    onClose={() => setShowInviteModModal(false)}
                    onConfirm={async () => {
                        setShowInviteModModal(false)
                        await handleInviteModerator()
                    }}
                />
            )}
        </main>
    )
}

export default ChatPage