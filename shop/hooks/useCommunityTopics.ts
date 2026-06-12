'use client'
import { useState, useEffect } from 'react'
import { ITopic } from '@/types/community'

export const useCommunityTopics = (category: string) => {
    const [topics, setTopics] = useState<ITopic[]>([])
    const [count, setCount] = useState(0)
    const [spinner, setSpinner] = useState(true)

    const fetchTopics = async (cat: string) => {
        setSpinner(true)
        try {
            const params = new URLSearchParams({ limit: '30' })
            if (cat) params.set('category', cat)
            const res = await fetch(`/api/community/topics?${params}`)
            const data = await res.json()
            if (data.status === 200) {
                setTopics(data.topics)
                setCount(data.count)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSpinner(false)
        }
    }

    useEffect(() => {
        fetchTopics(category)
    }, [category])

    return { topics, count, spinner }
}