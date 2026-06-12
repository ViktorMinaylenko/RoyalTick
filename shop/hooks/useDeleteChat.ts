'use client'
import { useState } from 'react'
import { IChat } from '@/types/lots'

export const useDeleteChat = (setChats: (updater: (prev: IChat[]) => IChat[]) => void) => {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null)

    const handleDelete = async (chatId: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setDeletingId(chatId)
        try {
            await fetch(`/api/chats/${chatId}/delete`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            setChats((prev) => prev.filter((c) => c._id !== chatId))
        } catch (error) {
            console.error(error)
        } finally {
            setDeletingId(null)
        }
    }

    return {
        deletingId,
        deleteConfirm, setDeleteConfirm,
        handleDelete,
    }
}