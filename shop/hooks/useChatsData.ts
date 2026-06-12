'use client'
import { useState, useEffect } from 'react'
import { IChat } from '@/types/lots'

export const useChatsData = () => {
    const [chats, setChats] = useState<IChat[]>([])
    const [spinner, setSpinner] = useState(true)

    useEffect(() => {
        Promise.all([
            fetch('/api/auction/lots/restore-inactive', { method: 'POST' }).catch(console.error),
            fetch('/api/auction/lots/finalize', { method: 'POST' }).catch(console.error),
        ])

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

    return { chats, setChats, spinner }
}