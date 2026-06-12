'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { ILot } from '@/types/lots'

export const usePriceProposal = (
    lotId: string,
    t: any,
    setLot: (updater: (prev: ILot | null) => ILot | null) => void
) => {
    const router = useRouter()
    const [proposalAmount, setProposalAmount] = useState('')
    const [proposalComment, setProposalComment] = useState('')
    const [proposalSpinner, setProposalSpinner] = useState(false)
    const [respondSpinner, setRespondSpinner] = useState(false)

    const handleProposePrice = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        if (!proposalAmount || Number(proposalAmount) <= 0) {
            toast.error(t.error_price)
            return
        }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setProposalSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots/${lotId}/propose-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ amount: Number(proposalAmount), comment: proposalComment }),
            })
            const data = await res.json()
            if (data.status === 200) {
                toast.success(t.proposal_sent)
                setLot((prev) => prev ? { ...prev, priceProposal: data.proposal } : prev)
                setProposalAmount('')
                setProposalComment('')
            } else {
                toast.error(data.message || t.error_generic)
            }
        } catch {
            toast.error(t.error_generic)
        } finally {
            setProposalSpinner(false)
        }
    }

    const handleRespondPrice = async (action: 'accept' | 'decline') => {
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setRespondSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots/${lotId}/respond-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ action }),
            })
            const data = await res.json()
            if (data.status === 200) {
                if (action === 'accept' && data.chat) {
                    router.push(`/chats/${data.chat._id}`)
                } else {
                    toast.success(t.proposal_declined)
                    setLot((prev) => prev ? {
                        ...prev,
                        priceProposal: { ...prev.priceProposal!, status: 'declined' }
                    } : prev)
                }
            } else {
                toast.error(data.message || t.error_generic)
            }
        } catch {
            toast.error(t.error_generic)
        } finally {
            setRespondSpinner(false)
        }
    }

    return {
        proposalAmount, setProposalAmount,
        proposalComment, setProposalComment,
        proposalSpinner,
        respondSpinner,
        handleProposePrice,
        handleRespondPrice,
    }
}