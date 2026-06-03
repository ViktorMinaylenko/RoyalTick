'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { isUserAuth, handleopenAuthModal, addOverflowHiddenToBody } from '@/lib/utils/common'
import { useLang } from '@/hooks/useLang'
import { ILot } from '@/types/lots'
import { openVerificationModal } from '@/context/modals'
import { $user } from '@/context/user/state'
import { useUnit } from 'effector-react'

export const useLotBid = (
    lotId: string,
    lot: ILot | null,
    setLot: (lot: ILot) => void
) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const currentUser = useUnit($user)
    const [bidAmount, setBidAmount] = useState(0)
    const [bidSpinner, setBidSpinner] = useState(false)

    const initBidAmount = (currentPrice: number, bidStep: number) => {
        setBidAmount(currentPrice + bidStep)
    }

    const handleBid = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        if (!lot) return

        if (!currentUser?.isVerified) {
            addOverflowHiddenToBody()
            openVerificationModal()
            return
        }

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