'use client'
import { useEffect, useState } from 'react'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/moderator/index.module.scss'
import { useModeratorRequests } from '@/hooks/useModeratorRequests'
import ModeratorRequestItem from '@/components/modules/ModeratorPage/ModeratorRequestItem'
import ModeratorChatItem from '@/components/modules/ModeratorPage/ModeratorChatItem'
import DeleteModeratorChatModal from '@/components/modules/ModeratorPage/DeleteModeratorChatModal'

const ModeratorPage = () => {
    const user = useUnit($user) as any
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).moderator
    const router = useRouter()

    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

    const {
        requests, myChats, spinner,
        joiningId, deletingChatId,
        fetchRequests, handleJoin, handleDeleteChat,
    } = useModeratorRequests()

    useEffect(() => {
        if (!user?._id) return
        if (user.role !== 'moderator' && user.role !== 'admin') {
            router.replace('/')
        }
    }, [user?._id, user?.role])

    useEffect(() => {
        if (!user?._id) return
        if (user.role !== 'moderator' && user.role !== 'admin') return

        fetchRequests()
        const interval = setInterval(fetchRequests, 15000)
        return () => clearInterval(interval)
    }, [user?._id])

    if (!user?._id || (user.role !== 'moderator' && user.role !== 'admin')) return null

    return (
        <main>
            <section className={styles.moderator}>
                <div className='container'>
                    <h1 className={styles.moderator__title}>
                        🛡️ {t?.title || 'Панель модератора'}
                    </h1>

                    {spinner && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                            <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                        </div>
                    )}

                    {!spinner && (
                        <>
                            <div className={styles.moderator__section}>
                                <h2 className={styles.moderator__section_title}>
                                    {t?.requests_title || 'Запити на приєднання'}
                                    {requests.length > 0 && (
                                        <span className={styles.moderator__badge}>{requests.length}</span>
                                    )}
                                </h2>

                                {!requests.length ? (
                                    <p className={styles.moderator__empty}>
                                        {t?.no_requests || 'Немає нових запитів'}
                                    </p>
                                ) : (
                                    <div className={styles.moderator__list}>
                                        {requests.map((chat) => (
                                            <ModeratorRequestItem
                                                key={chat._id}
                                                chat={chat}
                                                joiningId={joiningId}
                                                onJoin={handleJoin}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {myChats.length > 0 && (
                                <div className={styles.moderator__section}>
                                    <h2 className={styles.moderator__section_title}>
                                        {t?.my_chats_title || 'Мої активні чати'}
                                    </h2>
                                    <div className={styles.moderator__list}>
                                        {myChats.map((chat) => (
                                            <ModeratorChatItem
                                                key={chat._id}
                                                chat={chat}
                                                onDeleteClick={(id, title) =>
                                                    setDeleteConfirm({ id, title })
                                                }
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {deleteConfirm && (
                <DeleteModeratorChatModal
                    title={deleteConfirm.title}
                    chatId={deleteConfirm.id}
                    deletingId={deletingChatId}
                    onClose={() => setDeleteConfirm(null)}
                    onConfirm={() => handleDeleteChat(
                        deleteConfirm.id,
                        () => setDeleteConfirm(null)
                    )}
                />
            )}
        </main>
    )
}

export default ModeratorPage