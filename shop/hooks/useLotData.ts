'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ILot } from '@/types/lots'

export const useLotData = (
    id: string,
    initBidAmount: (price: number, step: number) => void,
    setActiveImg: (img: string) => void
) => {
    const router = useRouter()
    const [lot, setLot] = useState<ILot | null>(null)
    const [spinner, setSpinner] = useState(true)

    useEffect(() => {
        if (!id) return

        const fetchLot = async () => {
            try {
                const res = await fetch(`/api/auction/lots/${id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setLot(data.lot)
                    setActiveImg(data.lot.mainPhotoUrl)
                    initBidAmount(data.lot.currentPrice, data.lot.bidStep)

                    const isExpired = new Date() > new Date(data.lot.endDate)
                    if (isExpired && data.lot.status === 'active') {
                        await fetch('/api/auction/lots/finalize', { method: 'POST' })
                        const refreshed = await fetch(`/api/auction/lots/${id}`)
                        const refreshedData = await refreshed.json()
                        if (refreshedData.status === 200) setLot(refreshedData.lot)
                    }
                } else {
                    router.push('/auction')
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchLot()
    }, [id])

    return { lot, setLot, spinner }
}