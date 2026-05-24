'use client'
import { useState } from 'react'

export const usePhotoUpload = (count = 4) => {
    const [mainPhoto, setMainPhoto] = useState<File | null>(null)
    const [mainPhotoPreview, setMainPhotoPreview] = useState('')
    const [additionalPhotos, setAdditionalPhotos] = useState<(File | null)[]>(
        Array(count).fill(null)
    )
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(
        Array(count).fill('')
    )

    const handleMainPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setMainPhoto(file)
        setMainPhotoPreview(URL.createObjectURL(file))
    }

    const handleAdditionalPhoto = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const newPhotos = [...additionalPhotos]
        const newPreviews = [...additionalPreviews]
        newPhotos[index] = file
        newPreviews[index] = URL.createObjectURL(file)
        setAdditionalPhotos(newPhotos)
        setAdditionalPreviews(newPreviews)
    }

    return {
        mainPhoto, mainPhotoPreview,
        additionalPhotos, additionalPreviews,
        handleMainPhoto, handleAdditionalPhoto,
    }
}