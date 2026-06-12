'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/chats/index.module.scss'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'
import { IChat } from '@/types/lots'
import { useChatsData } from '@/hooks/useChatsData'
import { useDeleteChat } from '@/hooks/useDeleteChat'
import ChatListItem from '@/components/modules/ChatsPage/ChatListItem'
import DeleteChatModal from '@/components/modules/ChatsPage/DeleteChatModal'

const ChatsPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('chats')
    const user = useUnit($user) as any

    const { chats, setChats, spinner } = useChatsData()

    const {
        deletingId,
        deleteConfirm, setDeleteConfirm,
        handleDelete,
    } = useDeleteChat(setChats as (updater: (prev: IChat[]) => IChat[]) => void)

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