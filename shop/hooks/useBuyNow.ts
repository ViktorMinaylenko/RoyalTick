'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ILot } from '@/types/lots'

export const useBuyNow = (lot: ILot | null, t: any) => {
    const router = useRouter()
    const [showBuyNowModal, setShowBuyNowModal] = useState(false)
    const [buyNowConfirmed, setBuyNowConfirmed] = useState(false)
    const [buyNowSpinner, setBuyNowSpinner] = useState(false)

    const handleBuyNow = async () => {
        if (!lot) return
        setBuyNowSpinner(true)
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        try {
            const res = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ lotId: lot._id }),
            })
            const data = await res.json()
            if (data.status === 201 || data.status === 200) {
                setShowBuyNowModal(false)
                router.push(`/chats/${data.chat._id}`)
            }
        } catch (error) {
            console.error(error)
            toast.error(t.error_generic)
        } finally {
            setBuyNowSpinner(false)
        }
    }

    return {
        showBuyNowModal, setShowBuyNowModal,
        buyNowConfirmed, setBuyNowConfirmed,
        buyNowSpinner,
        handleBuyNow,
    }
}