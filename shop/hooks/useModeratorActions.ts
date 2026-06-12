'use client'
import { useState } from 'react'

export const useModeratorActions = (
    id: string | string[],
    setUserData: (updater: (prev: any) => any) => void
) => {
    const [blockSpinner, setBlockSpinner] = useState(false)
    const [showBlockModal, setShowBlockModal] = useState(false)
    const [blockReason, setBlockReason] = useState('')

    const [showReduceModal, setShowReduceModal] = useState(false)
    const [reduceType, setReduceType] = useState<'seller' | 'buyer'>('seller')
    const [reduceReason, setReduceReason] = useState('')
    const [reduceSpinner, setReduceSpinner] = useState(false)
    const [reducePercent, setReducePercent] = useState(20)

    const handleBlock = async (reason: string) => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setBlockSpinner(true)
        try {
            const res = await fetch(`/api/users/${id}/block`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ reason }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setUserData((prev: any) => ({
                    ...prev,
                    isBlocked: data.isBlocked,
                    blockReason: data.blockReason,
                }))
                setShowBlockModal(false)
                setBlockReason('')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setBlockSpinner(false)
        }
    }

    const handleReduceRating = async () => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setReduceSpinner(true)
        try {
            const res = await fetch(`/api/users/${id}/reduce-rating`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({
                    reason: reduceReason,
                    ratingType: reduceType,
                    percent: reducePercent,
                }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setShowReduceModal(false)
                setReduceReason('')
                const field = reduceType === 'seller' ? 'sellerRating' : 'buyerRating'
                setUserData((prev: any) => ({ ...prev, [field]: data.newRating }))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setReduceSpinner(false)
        }
    }

    return {
        blockSpinner, showBlockModal, setShowBlockModal,
        blockReason, setBlockReason,
        showReduceModal, setShowReduceModal,
        reduceType, setReduceType,
        reduceReason, setReduceReason,
        reduceSpinner, reducePercent, setReducePercent,
        handleBlock, handleReduceRating,
    }
}