'use client'
import { useEffect } from 'react'

export const useAuctionInit = (onInit: () => void) => {
    useEffect(() => {
        const init = async () => {
            await Promise.all([
                fetch('/api/auction/lots/finalize', { method: 'POST' }).catch(console.error),
                fetch('/api/auction/lots/restore-inactive', { method: 'POST' }).catch(console.error),
            ])
            onInit()
        }
        init()
    }, [])
}