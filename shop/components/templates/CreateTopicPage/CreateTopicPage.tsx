'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import styles from '@/styles/community/index.module.scss'
import auctionStyles from '@/styles/auction/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import toast from 'react-hot-toast'

const CreateTopicPage = () => {
    const router = useRouter()
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('create_topic')

    const CATEGORIES = [
        t.categories.valuation,
        t.categories.watches,
        t.categories.straps,
        t.categories.care,
        t.categories.auction,
        t.categories.trade,
        t.categories.general,
    ]

    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [category, setCategory] = useState('')
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [spinner, setSpinner] = useState(false)
    const [photos, setPhotos] = useState<(File | null)[]>([null, null, null, null])
    const [photoPreviews, setPhotoPreviews] = useState<(string | null)[]>([null, null, null, null])

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0]
        if (!file) return
        const newPhotos = [...photos]
        const newPreviews = [...photoPreviews]
        newPhotos[index] = file
        newPreviews[index] = URL.createObjectURL(file)
        setPhotos(newPhotos)
        setPhotoPreviews(newPreviews)
    }

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            if (tags.length >= 5) return
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()])
            }
            setTagInput('')
        }
    }

    const handleRemoveTag = (tag: string) => setTags(tags.filter(tg => tg !== tag))

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

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.create_topic}>
                <div className='container'>
                    <h1 className={styles.create_topic__title}>{t.create_title}</h1>

                    <div className={styles.create_topic__form}>

                        <div className={styles.create_topic__field}>
                            <label className={styles.create_topic__label}>
                                {t.field_title} <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <input
                                className={styles.create_topic__input}
                                placeholder={t.title_placeholder}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                maxLength={120}
                            />
                        </div>

                        <div className={styles.create_topic__field}>
                            <label className={styles.create_topic__label}>
                                {t.field_category} <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <select
                                className={styles.create_topic__select}
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value=''>{t.category_placeholder}</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.create_topic__field}>
                            <label className={styles.create_topic__label}>
                                {t.field_body} <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <textarea
                                className={styles.create_topic__textarea}
                                placeholder={t.body_placeholder}
                                value={body}
                                onChange={e => setBody(e.target.value)}
                            />
                        </div>

                        <div className={styles.create_topic__field}>
                            <label className={styles.create_topic__label}>
                                {t.field_photos || 'Фото (до 4)'}
                            </label>
                            <div className={auctionStyles.create_lot__photo_additional}>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <label key={i} className={auctionStyles.create_lot__photo_thumb}>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={e => handlePhotoChange(e, i)}
                                        />
                                        {photoPreviews[i] ? (
                                            <img src={photoPreviews[i]!} alt={`photo-${i}`} />
                                        ) : (
                                            <span className={auctionStyles.create_lot__photo_thumb__icon}>+</span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={styles.create_topic__field}>
                            <label className={styles.create_topic__label}>{t.field_tags}</label>
                            <input
                                className={styles.create_topic__input}
                                placeholder={t.tags_placeholder}
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                            />
                            {tags.length > 0 && (
                                <div className={styles.create_topic__tags}>
                                    {tags.map(tag => (
                                        <span key={tag} className={styles.create_topic__tag}>
                                            {tag}
                                            <button
                                                className='btn-reset'
                                                onClick={() => handleRemoveTag(tag)}
                                                style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.6 }}
                                            >✕</button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.create_topic__submit}>
                            <button
                                className={`btn-reset ${styles.create_topic__cancel}`}
                                onClick={() => router.back()}
                            >
                                {t.cancel}
                            </button>
                            <button
                                className={`btn-reset ${styles.create_topic__btn}`}
                                onClick={handleSubmit}
                                disabled={spinner || !title.trim() || !body.trim() || !category}
                            >
                                {spinner
                                    ? <FontAwesomeIcon icon={faSpinner} spin />
                                    : t.publish
                                }
                            </button>
                        </div>

                    </div>
                </div>
            </section>
        </main>
    )
}

export default CreateTopicPage