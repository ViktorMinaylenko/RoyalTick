'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const ChatIcon = () => {
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const fetchUnread = async () => {
            const authStr = localStorage.getItem('auth')
            if (!authStr) return
            const auth = JSON.parse(authStr)
            const userId = auth._id

            if (!userId) return

            try {
                const res = await fetch('/api/chats', {
                    headers: { Authorization: `Bearer ${auth.accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) {
                    const count = data.chats.reduce((acc: number, chat: any) => {
                        const isOwner = String(chat.ownerId) === String(userId)
                        const unreadMessages = chat.messages.filter(
                            (m: any) => !m.isRead && String(m.senderId) !== String(userId)
                        ).length
                        const ownerNotification = isOwner && chat.unreadForOwner ? 1 : 0
                        return acc + unreadMessages + ownerNotification
                    }, 0)
                    setUnreadCount(count)
                }
            } catch { }
        }

        fetchUnread()
        const interval = setInterval(fetchUnread, 10000)
        return () => clearInterval(interval)
    }, [])

    return (
        <Link
            href='/chats'
            className='header__links__item__btn header__links__item__btn--chat'
        >
            {unreadCount > 0 && (
                <span className='not-empty' />
            )}
        </Link>
    )
}

export default ChatIcon