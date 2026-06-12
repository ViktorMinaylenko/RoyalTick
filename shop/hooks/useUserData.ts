'use client'
import { useState, useEffect } from 'react'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'

export const useUserData = (id: string | string[], currentUserId?: string) => {
    const [userData, setUserData] = useState<any>(null)
    const [lots, setLots] = useState<any[]>([])
    const [spinner, setSpinner] = useState(true)
    const [followSpinner, setFollowSpinner] = useState(false)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)

    useEffect(() => {
        if (!id) return
        const fetchUser = async () => {
            try {
                const res = await fetch(`/api/users/${id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setUserData(data.user)
                    setLots(data.activeLots)
                    setFollowersCount(data.user.followersCount)
                    if (currentUserId) {
                        setIsFollowing(
                            data.user.followers.some((f: any) => String(f) === String(currentUserId))
                        )
                    }
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }
        fetchUser()
    }, [id, currentUserId])

    const handleFollow = async () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setFollowSpinner(true)
        try {
            const res = await fetch(`/api/users/${id}/follow`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setIsFollowing(data.isFollowing)
                setFollowersCount(data.followersCount)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setFollowSpinner(false)
        }
    }

    return {
        userData, setUserData,
        lots,
        spinner,
        followSpinner,
        isFollowing,
        followersCount,
        handleFollow,
    }
}