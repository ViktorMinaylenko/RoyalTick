'use client'
import { IChat } from '@/types/lots'
import { useLang } from '@/hooks/useLang'

export const useChats = (userId: string) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).chats

    const getUnreadCount = (chat: IChat) =>
        chat.messages.filter(
            (m) => !m.isRead && String(m.senderId) !== String(userId)
        ).length

    const getLastMessage = (chat: IChat) => {
        if (!chat.messages.length) return ''
        const last = chat.messages[chat.messages.length - 1]
        const isMe = String(last.senderId) === String(userId)
        return `${isMe ? t.you + ': ' : ''}${last.text}`
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const isToday = date.toDateString() === now.toDateString()
        return isToday
            ? date.toLocaleTimeString(lang === 'ua' ? 'uk-UA' : 'en-US', { hour: '2-digit', minute: '2-digit' })
            : date.toLocaleDateString(lang === 'ua' ? 'uk-UA' : 'en-US', { day: '2-digit', month: '2-digit' })
    }

    return { getUnreadCount, getLastMessage, formatDate }
}