'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useModeratorRequests = () => {
    const router = useRouter()
    const [requests, setRequests] = useState<any[]>([])
    const [myChats, setMyChats] = useState<any[]>([])
    const [spinner, setSpinner] = useState(true)
    const [joiningId, setJoiningId] = useState<string | null>(null)
    const [deletingChatId, setDeletingChatId] = useState<string | null>(null)

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

    const handleDeleteChat = async (chatId: string, onSuccess: () => void) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setDeletingChatId(chatId)
        try {
            await fetch(`/api/chats/${chatId}/delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            setMyChats(prev => prev.filter(c => c._id !== chatId))
            onSuccess()
        } catch (error) {
            console.error(error)
        } finally {
            setDeletingChatId(null)
        }
    }

    return {
        requests, myChats, spinner,
        joiningId, deletingChatId,
        fetchRequests, handleJoin, handleDeleteChat,
        setRequests, setMyChats,
    }
}