import { DeleteTarget } from '@/types/community'
import { useState } from 'react'


export const useModeratorDelete = (onSuccess?: (data?: any) => void) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [target, setTarget] = useState<DeleteTarget | null>(null)

    const openDeleteModal = (t: DeleteTarget) => {
        setTarget(t)
        setIsModalOpen(true)
    }

    const closeDeleteModal = () => {
        setIsModalOpen(false)
        setTarget(null)
    }

    const handleDelete = async (reason: string, punishment: string) => {
        if (!target) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setIsDeleting(true)

        try {
            const url = target.type === 'topic'
                ? `/api/community/topics/${target.topicId}`
                : `/api/community/topics/${target.topicId}/message/${target.msgId}`

            const res = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    reason: reason.trim() || null,
                    punishment,
                }),
            })

            const data = await res.json()
            if (data.status === 200) {
                closeDeleteModal()
                onSuccess?.(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsDeleting(false)
        }
    }

    return { isModalOpen, isDeleting, target, openDeleteModal, closeDeleteModal, handleDelete }
}