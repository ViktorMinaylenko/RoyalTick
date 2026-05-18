// components/modules/Header/ChatIcon.tsx
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
        <Link href='/chats' style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='#e8e9ea' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
            </svg>
            {unreadCount > 0 && (
                <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    background: '#7b2ff7',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: 700,
                    minWidth: '16px',
                    height: '16px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    )
}

export default ChatIcon