'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IChat } from '@/types/lots'

export const useChatData = (id: string) => {
    const router = useRouter()
    const [chat, setChat] = useState<IChat | null>(null)
    const [spinner, setSpinner] = useState(true)

    useEffect(() => {
        if (!id) return
        const auth = localStorage.getItem('auth')
        if (!auth) return
        const { accessToken } = JSON.parse(auth)

        const fetchChat = async () => {
            try {
                const res = await fetch(`/api/chats/${id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                })
                const data = await res.json()
                if (data.status === 200) setChat(data.chat)
                else router.push('/chats')
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchChat()
        const interval = setInterval(fetchChat, 3000)
        return () => clearInterval(interval)
    }, [id])

    return { chat, setChat, spinner }
}