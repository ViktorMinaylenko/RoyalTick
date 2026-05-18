'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/chats/index.module.scss'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import { IChat } from '@/types/lots'

const ChatsPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('chats')
    const user = useUnit($user) as any
    const [chats, setChats] = useState<IChat[]>([])
    const [spinner, setSpinner] = useState(true)

    useEffect(() => {
        fetch('/api/auction/lots/finalize', { method: 'POST' }).catch(console.error)

        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)

        const fetchChats = async () => {
            try {
                const res = await fetch('/api/chats', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) setChats(data.chats)
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchChats()
        const interval = setInterval(fetchChats, 5000)
        return () => clearInterval(interval)
    }, [])

    const getUnreadCount = (chat: IChat) =>
        chat.messages.filter(
            (m) => !m.isRead && String(m.senderId) !== String(user?._id)
        ).length

    const getLastMessage = (chat: IChat) => {
        if (!chat.messages.length) return ''
        const last = chat.messages[chat.messages.length - 1]
        const isMe = String(last.senderId) === String(user?._id)
        return `${isMe ? t.you + ': ' : ''}${last.text}`
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        return isToday
            ? date.toLocaleTimeString(lang === 'ua' ? 'uk-UA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { day: '2-digit', month: '2-digit' })
    }

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.chats}>
                <div className='container'>
                    <h1 className={styles.chats__title}>{t.title}</h1>

                    {spinner && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#7b2ff7' />
                        </div>
                    )}

                    {!spinner && !chats.length && (
                        <div className={styles.chats__empty}>
                            <span className={styles.chats__empty__icon}>💬</span>
                            <span className={styles.chats__empty__text}>{t.empty}</span>
                            <span className={styles.chats__empty__hint}>{t.empty_hint}</span>
                        </div>
                    )}

                    {!spinner && !!chats.length && (
                        <ul className={`list-reset ${styles.chats__list}`}>
                            {chats.map((chat) => {
                                const isOwner = String(chat.ownerId) === String(user?._id)
                                const unread = getUnreadCount(chat)
                                const lastMsg = getLastMessage(chat)
                                const lastDate = chat.messages.length
                                    ? formatDate(chat.messages[chat.messages.length - 1].createdAt)
                                    : formatDate(chat.createdAt)

                                return (
                                    <li key={chat._id}>
                                        <Link href={`/chats/${chat._id}`} className={styles.chats__item}>
                                            <div className={styles.chats__item_photo}>
                                                <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
                                            </div>
                                            <div className={styles.chats__item_info}>
                                                <span className={styles.chats__item_role}>
                                                    {isOwner ? t.owner : t.winner}
                                                </span>
                                                <span className={styles.chats__item_lot}>{chat.lotTitle}</span>
                                                {lastMsg && (
                                                    <span className={styles.chats__item_last}>{lastMsg}</span>
                                                )}
                                            </div>
                                            <div className={styles.chats__item_meta}>
                                                <span className={styles.chats__item_date}>{lastDate}</span>
                                                {unread > 0 && (
                                                    <span className={styles.chats__item_badge}>
                                                        {unread > 9 ? '9+' : unread}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ChatsPage