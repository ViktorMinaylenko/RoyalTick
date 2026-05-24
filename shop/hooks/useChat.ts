'use client'
import { useState } from 'react'
import { IChat } from '@/types/lots'

export const useChat = (chatId: string, setChat: (chat: IChat) => void) => {
    const [text, setText] = useState('')
    const [sendSpinner, setSendSpinner] = useState(false)
    const [completeSpinner, setCompleteSpinner] = useState(false)
    const [selectedRating, setSelectedRating] = useState(0)
    const [ratingComment, setRatingComment] = useState('')
    const [ratingSpinner, setRatingSpinner] = useState(false)
    const [inviteModSpinner, setInviteModSpinner] = useState(false)

    const getAuth = () => JSON.parse(localStorage.getItem('auth') as string)

    const handleSend = async () => {
        if (!text.trim() || sendSpinner) return
        const auth = getAuth()
        setSendSpinner(true)
        try {
            const res = await fetch(`/api/chats/${chatId}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ text }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setChat(data.chat)
                setText('')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSendSpinner(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleComplete = async () => {
        const auth = getAuth()
        setCompleteSpinner(true)
        try {
            const res = await fetch(`/api/chats/${chatId}/complete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setCompleteSpinner(false)
        }
    }

    const handleRate = async (skip = false) => {
        if (!skip && !selectedRating) return
        const auth = getAuth()
        setRatingSpinner(true)
        try {
            const res = await fetch(`/api/chats/${chatId}/rate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    rating: skip ? 0 : selectedRating,
                    comment: skip ? '' : ratingComment,
                    skipped: skip,
                }),
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setRatingSpinner(false)
        }
    }

    const handleInviteModerator = async () => {
        const auth = getAuth()
        setInviteModSpinner(true)
        try {
            const res = await fetch(`/api/chats/${chatId}/invite-moderator`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) setChat(data.chat)
        } catch (error) {
            console.error(error)
        } finally {
            setInviteModSpinner(false)
        }
    }

    return {
        text, setText,
        sendSpinner, completeSpinner, ratingSpinner, inviteModSpinner,
        selectedRating, setSelectedRating,
        ratingComment, setRatingComment,
        handleSend, handleKeyDown, handleComplete, handleRate, handleInviteModerator,
    }
}