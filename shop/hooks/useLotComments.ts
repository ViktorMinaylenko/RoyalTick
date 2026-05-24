'use client'
import { useState, useCallback } from 'react'

export const useLotComments = (lotId: string) => {
    const [comments, setComments] = useState<any[]>([])
    const [commentText, setCommentText] = useState('')
    const [commentSpinner, setCommentSpinner] = useState(false)

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch(`/api/auction/lots/${lotId}/comments`)
            const data = await res.json()
            if (data.status === 200) setComments(data.comments)
        } catch (error) {
            console.error(error)
        }
    }, [lotId])

    const handleComment = async () => {
        if (!commentText.trim()) return
        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setCommentSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots/${lotId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.accessToken}`,
                },
                body: JSON.stringify({ text: commentText }),
            })
            const data = await res.json()
            if (data.status === 200) {
                setComments(data.comments)
                setCommentText('')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setCommentSpinner(false)
        }
    }

    return {
        comments, commentText, setCommentText,
        commentSpinner, fetchComments, handleComment,
    }
}