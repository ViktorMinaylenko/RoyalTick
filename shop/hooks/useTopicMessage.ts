'use client'
import { useState, useRef } from 'react'
import { ITopic } from '@/types/community'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'

export const useTopicMessage = (
    id: string | string[],
    setTopic: (updater: (prev: ITopic | null) => ITopic | null) => void
) => {
    const [text, setText] = useState('')
    const [sendSpinner, setSendSpinner] = useState(false)
    const [replyTo, setReplyTo] = useState<{ id: string; userName: string } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleSend = async () => {
        if (!text.trim()) return
        if (!isUserAuth()) { handleopenAuthModal(); return }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSendSpinner(true)
        try {
            const res = await fetch(`/api/community/topics/${id}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    text,
                    replyToId: replyTo?.id || null,
                    replyToUserName: replyTo?.userName || null,
                }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setTopic(() => data.topic)
                setText('')
                setReplyTo(null)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSendSpinner(false)
        }
    }

    const handleReply = (msgId: string, userName: string) => {
        setReplyTo({ id: msgId, userName })
        textareaRef.current?.focus()
    }

    return {
        text, setText,
        sendSpinner,
        replyTo, setReplyTo,
        textareaRef,
        handleSend,
        handleReply,
    }
}