'use client'
import { useState, useEffect } from 'react'
import { ILot } from '@/types/lots'

export const useSellerLots = (lot: ILot | null) => {
    const [sellerLots, setSellerLots] = useState<ILot[]>([])

    useEffect(() => {
        if (!lot?.userId) return

        const fetchSellerLots = async () => {
            try {
                const res = await fetch(`/api/auction/lots?userId=${lot.userId}&limit=10`)
                const data = await res.json()
                if (data.status === 200) {
                    setSellerLots(data.lots.filter((l: ILot) => l._id !== lot._id))
                }
            } catch (error) {
                console.error(error)
            }
        }

        fetchSellerLots()
    }, [lot?.userId])

    return { sellerLots }
}