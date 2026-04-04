import { useEffect, useRef, useState } from 'react'

export const useClickOutside = <T extends HTMLElement = HTMLDivElement>() => {
    const ref = useRef<T>(null)
    const [open, setOpen] = useState(false)

    const toggle = () => setOpen((prev) => !prev)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {

            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return { open, setOpen, toggle, ref }
}