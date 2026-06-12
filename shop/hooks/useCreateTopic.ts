'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export const useCreateTopic = (t: any, photos: (File | null)[]) => {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [category, setCategory] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [spinner, setSpinner] = useState(false)

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            if (tags.length >= 5) return
            if (!tags.includes(tagInput.trim())) {
                setTags((prev) => [...prev, tagInput.trim()])
            }
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) =>
        setTags((prev) => prev.filter((tg) => tg !== tag))

    const handleSubmit = async () => {
        if (!title.trim() || !body.trim() || !category) {
            toast.error(t.required)
            return
        }

        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSpinner(true)

        try {
            const formData = new FormData()
            formData.append('title', title)
            formData.append('body', body)
            formData.append('category', category)
            formData.append('tags', JSON.stringify(tags))
            photos.forEach((photo, i) => {
                if (photo) formData.append(`photo_${i}`, photo)
            })

            const res = await fetch('/api/community/topics', {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                body: formData,
            })
            const data = await res.json()

            if (data.status === 201) {
                toast.success(t.success)
                router.push(`/community/${data.topic._id}`)
            } else {
                toast.error(data.message || t.required)
            }
        } catch (error) {
            console.error(error)
            toast.error(t.required)
        } finally {
            setSpinner(false)
        }
    }

    return {
        title, setTitle,
        body, setBody,
        category, setCategory,
        tagInput, setTagInput,
        tags,
        spinner,
        handleAddTag,
        handleRemoveTag,
        handleSubmit,
    }
}