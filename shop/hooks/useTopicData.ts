'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ITopic } from '@/types/community'
import { isUserAuth } from '@/lib/utils/common'

export const useTopicData = (id: string | string[], userId?: string) => {
    const router = useRouter()
    const [topic, setTopic] = useState<ITopic | null>(null)
    const [spinner, setSpinner] = useState(true)
    const [isLiked, setIsLiked] = useState(false)
    const [likesCount, setLikesCount] = useState(0)
    const [likeSpinner, setLikeSpinner] = useState(false)

    useEffect(() => {
        if (!id) return

        const fetchTopic = async () => {
            try {
                const res = await fetch(`/api/community/topics/${id}`)
                const data = await res.json()
                if (data.status === 200) {
                    setTopic(data.topic)
                    setLikesCount(data.topic.likes?.length ?? 0)
                    if (userId) {
                        setIsLiked(
                            data.topic.likes?.some((l: any) => String(l) === String(userId))
                        )
                        fetch(`/api/community/topics/${id}/view`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId }),
                        })
                            .then(r => r.json())
                            .then(d => {
                                if (d.views !== undefined) {
                                    setTopic((prev) =>
                                        prev ? { ...prev, views: d.views } : prev
                                    )
                                }
                            })
                            .catch(console.error)
                    }
                } else {
                    router.push('/community')
                }
            } catch (error) {
                console.error(error)
            } finally {
                setSpinner(false)
            }
        }

        fetchTopic()
    }, [id, userId])

    const handleLike = async () => {
        if (!isUserAuth()) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setLikeSpinner(true)
        try {
            const res = await fetch(`/api/community/topics/${id}/like`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            })
            const data = await res.json()
            if (data.status === 200) {
                setIsLiked(data.isLiked)
                setLikesCount(data.likesCount)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLikeSpinner(false)
        }
    }

    return {
        topic, setTopic,
        spinner,
        isLiked, likesCount, likeSpinner,
        handleLike,
    }
}