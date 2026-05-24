'use client'
import { useEffect, useState } from 'react'

export const useCountdown = (endDate: string) => {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        const calc = () => {
            const diff = new Date(endDate).getTime() - Date.now()
            if (diff <= 0) { setTimeLeft('00:00:00'); return }
            const d = Math.floor(diff / 86400000)
            const h = Math.floor((diff % 86400000) / 3600000)
            const m = Math.floor((diff % 3600000) / 60000)
            const s = Math.floor((diff % 60000) / 1000)
            setTimeLeft(
                `${d > 0 ? `${d} д ` : ''}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            )
        }
        calc()
        const timer = setInterval(calc, 1000)
        return () => clearInterval(timer)
    }, [endDate])

    return timeLeft
}