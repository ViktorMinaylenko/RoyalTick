'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/chats/index.module.scss'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import { IChat } from '@/types/lots'
import ChatListItem from '@/components/modules/ChatsPage/ChatListItem'
import DeleteChatModal from '@/components/modules/ChatsPage/DeleteChatModal'

const ChatsPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('chats')
    const user = useUnit($user) as any

    const [chats, setChats] = useState<IChat[]>([])
    const [spinner, setSpinner] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

    useEffect(() => {
        fetch('/api/auction/lots/restore-inactive', { method: 'POST' }).catch(console.error)
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

    const handleDelete = async (chatId: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setDeletingId(chatId)
        try {
            await fetch(`/api/chats/${chatId}/delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            setChats(prev => prev.filter(c => c._id !== chatId))
        } catch (error) {
            console.error(error)
        } finally {
            setDeletingId(null)
        }
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
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
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
                            {chats.map((chat) => (
                                <ChatListItem
                                    key={chat._id}
                                    chat={chat}
                                    userId={String(user?._id)}
                                    onDeleteClick={(id, title) =>
                                        setDeleteConfirm({ id, title })
                                    }
                                />
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            {deleteConfirm && (
                <DeleteChatModal
                    title={deleteConfirm.title}
                    chatId={deleteConfirm.id}
                    deletingId={deletingId}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={async () => {
                        const id = deleteConfirm.id
                        setDeleteConfirm(null)
                        await handleDelete(id)
                    }}
                />
            )}
        </main>
    )
}

export default ChatsPage