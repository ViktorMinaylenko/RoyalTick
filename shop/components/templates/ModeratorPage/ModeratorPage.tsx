'use client'
import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/moderator/index.module.scss'

const ModeratorPage = () => {
    const user = useUnit($user) as any
    const { lang, translations } = useLang()
    const t = translations[lang] as any
    const router = useRouter()
    const [requests, setRequests] = useState<any[]>([])
    const [myChats, setMyChats] = useState<any[]>([])
    const [spinner, setSpinner] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, title: string } | null>(null)

    useEffect(() => {
        if (!user?._id) return
        if (user.role !== 'moderator' && user.role !== 'admin') {
            router.replace('/')
        }
    }, [user?._id, user?.role])

    useEffect(() => {
        if (!user?._id) return
        if (user.role !== 'moderator' && user.role !== 'admin') {
            router.push('/')
            return
        }

        const fetchRequests = async () => {
            const auth = localStorage.getItem('auth')
            if (!auth) return
            const { accessToken } = JSON.parse(auth)
            try {
                const res = await fetch('/api/moderator/requests', {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) {
                    setRequests(data.requests)
                    setMyChats(data.myChats)
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchRequests()
        const interval = setInterval(fetchRequests, 15000)
        return () => clearInterval(interval)
    }, [user?._id])

    const handleJoin = async (chatId: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setJoiningId(chatId)
        try {
            const res = await fetch(`/api/moderator/chats/${chatId}/join`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setRequests(prev => prev.filter(r => r._id !== chatId))
                router.push(`/chats/${chatId}`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setJoiningId(null)
        }
    }

    const handleDeleteChat = async (chatId: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setDeletingChatId(chatId)
        try {
            await fetch(`/api/chats/${chatId}/delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            setMyChats(prev => prev.filter(c => c._id !== chatId))
            setDeleteConfirm(null)
        } catch (error) {
            console.error(error)
        } finally {
            setDeletingChatId(null)
        }
    }

    if (!user?._id || (user.role !== 'moderator' && user.role !== 'admin')) return null

    return (
        <main>
            <section className={styles.moderator}>
                <div className='container'>
                    <h1 className={styles.moderator__title}>🛡️ Панель модератора</h1>

                    {spinner && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#7b2ff7' />
                        </div>
                    )}

                    {!spinner && (
                        <>
                            <div className={styles.moderator__section}>
                                <h2 className={styles.moderator__section_title}>
                                    Запити на приєднання
                                    {requests.length > 0 && (
                                        <span className={styles.moderator__badge}>{requests.length}</span>
                                    )}
                                </h2>

                                {!requests.length ? (
                                    <p className={styles.moderator__empty}>Немає нових запитів</p>
                                ) : (
                                    <div className={styles.moderator__list}>
                                        {requests.map((chat) => (
                                            <div key={chat._id} className={styles.moderator__item}>
                                                <div className={styles.moderator__item_photo}>
                                                    <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
                                                </div>
                                                <div className={styles.moderator__item_info}>
                                                    <span className={styles.moderator__item_lot}>{chat.lotTitle}</span>
                                                    <span className={styles.moderator__item_users}>
                                                        {chat.winnerName} ↔ {chat.ownerName}
                                                    </span>
                                                    <span className={styles.moderator__item_msgs}>
                                                        {chat.messages.length} повідомлень
                                                    </span>
                                                </div>
                                                <button
                                                    className={`btn-reset ${styles.moderator__join_btn}`}
                                                    onClick={() => handleJoin(chat._id)}
                                                    disabled={joiningId === chat._id}
                                                >
                                                    {joiningId === chat._id
                                                        ? <FontAwesomeIcon icon={faSpinner} spin />
                                                        : 'Приєднатись'
                                                    }
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {myChats.length > 0 && (
                                <div className={styles.moderator__section}>
                                    <h2 className={styles.moderator__section_title}>Мої активні чати</h2>
                                    <div className={styles.moderator__list}>
                                        {myChats.map((chat) => (
                                            <div key={chat._id} className={styles.moderator__item} style={{ position: 'relative' }}>
                                                <Link href={`/chats/${chat._id}`} style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                                                    <div className={styles.moderator__item_photo}>
                                                        <img src={chat.lotPhoto || '/img/no-image.jpg'} alt={chat.lotTitle} />
                                                    </div>
                                                    <div className={styles.moderator__item_info}>
                                                        <span className={styles.moderator__item_lot}>{chat.lotTitle}</span>
                                                        <span className={styles.moderator__item_users}>
                                                            {chat.winnerName} ↔ {chat.ownerName}
                                                        </span>
                                                    </div>
                                                </Link>
                                                <button
                                                    className={`btn-reset ${styles.moderator__delete_btn}`}
                                                    onClick={() => setDeleteConfirm({ id: chat._id, title: chat.lotTitle })}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                        {deleteConfirm && (
                                            <div className={styles.moderator__overlay} onClick={() => setDeleteConfirm(null)}>
                                                <div className={styles.moderator__confirm} onClick={e => e.stopPropagation()}>
                                                    <h3>Видалити чат?</h3>
                                                    <p>«{deleteConfirm.title}»</p>
                                                    <div className={styles.moderator__confirm_btns}>
                                                        <button className={`btn-reset ${styles.moderator__cancel_btn}`} onClick={() => setDeleteConfirm(null)}>
                                                            Скасувати
                                                        </button>
                                                        <button
                                                            className={`btn-reset ${styles.moderator__confirm_btn}`}
                                                            onClick={() => handleDeleteChat(deleteConfirm.id)}
                                                            disabled={deletingChatId === deleteConfirm.id}
                                                        >
                                                            {deletingChatId === deleteConfirm.id ? '...' : 'Видалити'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </main>
    )
}

export default ModeratorPage