'use client'
import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import { $isAuth } from '@/context/auth/state'
import { setNotifications, setUnreadCount } from '@/context/notifications'
import { $notifications, $unreadCount } from '@/context/notifications/state'

export const useNotifications = () => {
    const isAuth = useUnit($isAuth)
    const notifications = useUnit($notifications)
    const unreadCount = useUnit($unreadCount)

    const fetchNotifications = async () => {
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)

        try {
            const res = await fetch('/api/notifications', {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const markAllRead = async () => {
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)
        try {
            await fetch('/api/notifications/read-all', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            setNotifications(notifications.map(n => ({ ...n, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error(error)
        }
    }

    const markOneRead = async (id: string) => {
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)
        try {
            await fetch(`/api/notifications/${id}/read`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            setNotifications(
                notifications.map(n => n._id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(Math.max(0, unreadCount - 1))
        } catch (error) {
            console.error(error)
        }
    }

    const clearAll = async () => {
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)
        try {
            await fetch('/api/notifications/clear', {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            setNotifications([])
            setUnreadCount(0)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (!isAuth) return
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [isAuth])

    return { notifications, unreadCount, markAllRead, markOneRead, clearAll }
}