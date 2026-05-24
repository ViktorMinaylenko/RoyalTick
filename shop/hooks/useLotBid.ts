'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { useLang } from '@/hooks/useLang'
import { ILot } from '@/types/lots'

export const useLotBid = (
    lotId: string,
    lot: ILot | null,
    setLot: (lot: ILot) => void
) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const [bidAmount, setBidAmount] = useState(0)
    const [bidSpinner, setBidSpinner] = useState(false)

    const initBidAmount = (currentPrice: number, bidStep: number) => {
        setBidAmount(currentPrice + bidStep)
    }

    const handleBid = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        if (!lot) return

        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setBidSpinner(true)

        try {
            const res = await fetch(`/api/auction/lots/${lotId}/bid`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ bidAmount }),
            })

            const data = await res.json()
            if (data.status === 200) {
                setLot(data.lot)
                setBidAmount(data.lot.currentPrice + data.lot.bidStep)
                toast.success(t.bid_success)
            } else {
                toast.error(data.message)
            }
        } catch {
            toast.error(t.error_generic)
        } finally {
            setBidSpinner(false)
        }
    }

    return { bidAmount, setBidAmount, bidSpinner, handleBid, initBidAmount }
}