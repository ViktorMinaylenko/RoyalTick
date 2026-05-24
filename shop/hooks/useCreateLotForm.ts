'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { useLang } from '@/hooks/useLang'
import { ILotForm, initialForm } from '@/types/lots'



export const useCreateLotForm = (
    mainPhoto: File | null,
    additionalPhotos: (File | null)[]
) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const router = useRouter()

    const [form, setForm] = useState<ILotForm>(initialForm)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [spinner, setSpinner] = useState(false)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target
        const checked = (e.target as HTMLInputElement).checked
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'category' ? { subcategory: '' } : {}),
        }))
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const handleDeliveryMethodChange = (method: string) => {
        setForm((prev) => ({
            ...prev,
            deliveryMethods: prev.deliveryMethods.includes(method)
                ? prev.deliveryMethods.filter((m) => m !== method)
                : [...prev.deliveryMethods, method],
        }))
        if (errors.deliveryMethods) setErrors((prev) => ({ ...prev, deliveryMethods: '' }))
    }

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!form.title.trim()) newErrors.title = t.error_required
        if (!form.category) newErrors.category = t.error_required
        if (!form.subcategory) newErrors.subcategory = t.error_required
        if (!form.description.trim()) newErrors.description = t.error_required
        if (!form.condition) newErrors.condition = t.error_required
        if (!mainPhoto) newErrors.mainPhoto = t.error_required
        if (!form.startPrice || +form.startPrice <= 0) newErrors.startPrice = t.error_price
        if (!form.bidStep || +form.bidStep <= 0) newErrors.bidStep = t.error_price
        if (!form.endDate) newErrors.endDate = t.error_required
        if (!form.location.trim()) newErrors.location = t.error_required
        if (!form.deliveryMethods.length) newErrors.deliveryMethods = t.error_required
        if (!form.confirmRules) newErrors.confirmRules = t.error_rules
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) {
            toast.error(t.error_fill_required)
            return
        }

        const auth = JSON.parse(localStorage.getItem('auth') as string)
        setSpinner(true)

        try {
            const formData = new FormData()
            Object.entries(form).forEach(([key, val]) => {
                if (key === 'deliveryMethods') return
                formData.append(key, String(val))
            })
            form.deliveryMethods.forEach((m) => formData.append('deliveryMethods', m))
            if (mainPhoto) formData.append('mainPhoto', mainPhoto)
            additionalPhotos.forEach((photo, i) => {
                if (photo) formData.append(`additionalPhoto_${i}`, photo)
            })

            const res = await fetch('/api/auction/lots', {
                method: 'POST',
                headers: { Authorization: `Bearer ${auth.accessToken}` },
                body: formData,
            })

            const data = await res.json()
            if (data.status === 201) {
                toast.success(t.success_created)
                router.push('/auction')
            } else if (data.status === 402) {
                toast.error(data.message)
                router.push('/profile')
            } else {
                toast.error(data.message || t.error_generic)
            }
        } catch (error) {
            console.error(error)
            toast.error(t.error_generic)
        } finally {
            setSpinner(false)
        }
    }

    return {
        form, errors, spinner,
        handleChange,
        handleDeliveryMethodChange,
        handleSubmit,
    }
}