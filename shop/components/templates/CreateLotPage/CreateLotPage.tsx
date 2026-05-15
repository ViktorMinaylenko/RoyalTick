'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import toast from 'react-hot-toast'
import styles from '@/styles/auction/index.module.scss'
import { itemCategories, auctionSubcategories } from '@/constants/product'
import {
    auctionSaleTypes,
    auctionConditions,
    auctionDeliveryMethods,
} from '@/constants/auction'
import { useEffect } from 'react'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'

const CreateLotPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('create_lot')
    const router = useRouter()
    const mainPhotoRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!isUserAuth()) {
            handleopenAuthModal()
            router.push('/auction')
        }
    }, [])

    const [form, setForm] = useState({
        title: '',
        category: '',
        subcategory: '',
        description: '',
        condition: '',
        saleType: 'auction',
        startPrice: '',
        bidStep: '',
        reservePrice: '',
        buyNowPrice: '',
        startDate: '',
        endDate: '',
        autoExtend: false,
        location: '',
        deliveryMethods: [] as string[],
        deliveryPayer: 'buyer',
        returnsAllowed: false,
        guarantees: '',
        buyerComment: '',
        moderatorNote: '',
        confirmRules: false,
        videoUrl: '',
    })

    const [mainPhoto, setMainPhoto] = useState<File | null>(null)
    const [mainPhotoPreview, setMainPhotoPreview] = useState('')
    const [additionalPhotos, setAdditionalPhotos] = useState<(File | null)[]>([null, null, null, null])
    const [additionalPreviews, setAdditionalPreviews] = useState<string[]>(['', '', '', ''])
    const [spinner, setSpinner] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

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
            console.log('Response:', data)
            if (data.status === 201) {
                toast.success(t.success_created)
                router.push('/auction')
            } else {
                toast.error(data.message || t.error_generic)
            }
        } catch (error) {
            console.error('Auction lot error:', error)
            toast.error(t.error_generic)
        } finally {
            setSpinner(false)
        }
    }

    const subcategoryOptions = form.category ? auctionSubcategories[form.category] || [] : []

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.create_lot}>
                <div className='container'>
                    <h1 className={styles.create_lot__title}>{t.create_lot}</h1>

                    <form className={styles.create_lot__form} onSubmit={handleSubmit} noValidate>

                        {/* ── 1. ОСНОВНІ ПОЛЯ ── */}
                        <div className={styles.create_lot__section}>
                            <h2 className={styles.create_lot__section_title}>{t.section_main}</h2>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.title}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <input
                                    name='title'
                                    className={`${styles.create_lot__input} ${errors.title ? styles.create_lot__input_error : ''}`}
                                    placeholder={t.title_placeholder}
                                    value={form.title}
                                    onChange={handleChange}
                                    maxLength={120}
                                />
                                {errors.title && <span className={styles.create_lot__error}>{errors.title}</span>}
                            </div>

                            <div className={styles.create_lot__row}>
                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>
                                        {t.category}<span className={styles.create_lot__label_required}>*</span>
                                    </label>
                                    <select
                                        name='category'
                                        className={`${styles.create_lot__select} ${errors.category ? styles.create_lot__input_error : ''}`}
                                        value={form.category}
                                        onChange={handleChange}
                                    >
                                        <option value=''>{t.select_placeholder}</option>
                                        {itemCategories.map((cat) => (
                                            <option key={cat} value={cat}>{t[`cat_${cat}`]}</option>
                                        ))}
                                    </select>
                                    {errors.category && <span className={styles.create_lot__error}>{errors.category}</span>}
                                </div>

                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>
                                        {t.subcategory}<span className={styles.create_lot__label_required}>*</span>
                                    </label>
                                    <select
                                        name='subcategory'
                                        className={`${styles.create_lot__select} ${errors.subcategory ? styles.create_lot__input_error : ''}`}
                                        value={form.subcategory}
                                        onChange={handleChange}
                                        disabled={!form.category}
                                    >
                                        <option value=''>{t.select_placeholder}</option>
                                        {subcategoryOptions.map((sub) => (
                                            <option key={sub} value={sub}>{t[`sub_${sub}`]}</option>
                                        ))}
                                    </select>
                                    {errors.subcategory && <span className={styles.create_lot__error}>{errors.subcategory}</span>}
                                </div>
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.description}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <textarea
                                    name='description'
                                    className={`${styles.create_lot__textarea} ${errors.description ? styles.create_lot__input_error : ''}`}
                                    placeholder={t.description_placeholder}
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={5}
                                    maxLength={2000}
                                />
                                {errors.description && <span className={styles.create_lot__error}>{errors.description}</span>}
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.condition}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <select
                                    name='condition'
                                    className={`${styles.create_lot__select} ${errors.condition ? styles.create_lot__input_error : ''}`}
                                    value={form.condition}
                                    onChange={handleChange}
                                >
                                    <option value=''>{t.select_placeholder}</option>
                                    {auctionConditions.map((c) => (
                                        <option key={c} value={c}>{t[`condition_${c}`]}</option>
                                    ))}
                                </select>
                                {errors.condition && <span className={styles.create_lot__error}>{errors.condition}</span>}
                            </div>
                        </div>

                        {/* ── 2. ФОТО ТА МЕДІА ── */}
                        <div className={styles.create_lot__section}>
                            <h2 className={styles.create_lot__section_title}>{t.section_media}</h2>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.main_photo}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <div
                                    className={styles.create_lot__photo_upload}
                                    onClick={() => mainPhotoRef.current?.click()}
                                >
                                    <input
                                        ref={mainPhotoRef}
                                        type='file'
                                        accept='image/*'
                                        style={{ display: 'none' }}
                                        onChange={handleMainPhoto}
                                    />
                                    {mainPhotoPreview ? (
                                        <img src={mainPhotoPreview} alt='preview' className={styles.create_lot__photo_upload__preview} />
                                    ) : (
                                        <>
                                            <span className={styles.create_lot__photo_upload__icon}>📷</span>
                                            <span className={styles.create_lot__photo_upload__text}>{t.photo_upload_hint}</span>
                                        </>
                                    )}
                                </div>
                                {errors.mainPhoto && <span className={styles.create_lot__error}>{errors.mainPhoto}</span>}
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.additional_photos}</label>
                                <div className={styles.create_lot__photo_additional}>
                                    {additionalPhotos.map((_, i) => (
                                        <label key={i} className={styles.create_lot__photo_thumb}>
                                            <input type='file' accept='image/*' onChange={(e) => handleAdditionalPhoto(i, e)} />
                                            {additionalPreviews[i]
                                                ? <img src={additionalPreviews[i]} alt={`photo-${i}`} />
                                                : <span className={styles.create_lot__photo_thumb__icon}>＋</span>
                                            }
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.video}</label>
                                <input
                                    name='videoUrl'
                                    className={styles.create_lot__input}
                                    placeholder={t.video_placeholder}
                                    value={form.videoUrl}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* ── 3. ПАРАМЕТРИ АУКЦІОНУ ── */}
                        <div className={styles.create_lot__section}>
                            <h2 className={styles.create_lot__section_title}>{t.section_auction}</h2>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.sale_type}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <select
                                    name='saleType'
                                    className={styles.create_lot__select}
                                    value={form.saleType}
                                    onChange={handleChange}
                                >
                                    {auctionSaleTypes.map((s) => (
                                        <option key={s} value={s}>{t[`sale_type_${s}`]}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.create_lot__row3}>
                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>
                                        {t.start_price}<span className={styles.create_lot__label_required}>*</span>
                                    </label>
                                    <input
                                        name='startPrice'
                                        type='number'
                                        min={1}
                                        className={`${styles.create_lot__input} ${errors.startPrice ? styles.create_lot__input_error : ''}`}
                                        placeholder='₴'
                                        value={form.startPrice}
                                        onChange={handleChange}
                                    />
                                    {errors.startPrice && <span className={styles.create_lot__error}>{errors.startPrice}</span>}
                                </div>

                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>
                                        {t.bid_step}<span className={styles.create_lot__label_required}>*</span>
                                    </label>
                                    <input
                                        name='bidStep'
                                        type='number'
                                        min={1}
                                        className={`${styles.create_lot__input} ${errors.bidStep ? styles.create_lot__input_error : ''}`}
                                        placeholder='₴'
                                        value={form.bidStep}
                                        onChange={handleChange}
                                    />
                                    {errors.bidStep && <span className={styles.create_lot__error}>{errors.bidStep}</span>}
                                </div>

                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>{t.reserve_price}</label>
                                    <input
                                        name='reservePrice'
                                        type='number'
                                        min={1}
                                        className={styles.create_lot__input}
                                        placeholder='₴'
                                        value={form.reservePrice}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.buy_now_price}</label>
                                <input
                                    name='buyNowPrice'
                                    type='number'
                                    min={1}
                                    className={styles.create_lot__input}
                                    placeholder='₴'
                                    value={form.buyNowPrice}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className={styles.create_lot__row}>
                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>{t.start_date}</label>
                                    <input
                                        name='startDate'
                                        type='datetime-local'
                                        className={styles.create_lot__input}
                                        value={form.startDate}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className={styles.create_lot__field}>
                                    <label className={styles.create_lot__label}>
                                        {t.end_date}<span className={styles.create_lot__label_required}>*</span>
                                    </label>
                                    <input
                                        name='endDate'
                                        type='datetime-local'
                                        className={`${styles.create_lot__input} ${errors.endDate ? styles.create_lot__input_error : ''}`}
                                        value={form.endDate}
                                        onChange={handleChange}
                                    />
                                    {errors.endDate && <span className={styles.create_lot__error}>{errors.endDate}</span>}
                                </div>
                            </div>

                            <label className={styles.create_lot__toggle}>
                                <input
                                    type='checkbox'
                                    name='autoExtend'
                                    checked={form.autoExtend}
                                    onChange={handleChange}
                                />
                                <span className={styles.create_lot__toggle__track} />
                                <span className={styles.create_lot__toggle__label}>{t.auto_extend}</span>
                            </label>
                        </div>

                        {/* ── 4. ДОСТАВКА ── */}
                        <div className={styles.create_lot__section}>
                            <h2 className={styles.create_lot__section_title}>{t.section_delivery}</h2>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.location}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <input
                                    name='location'
                                    className={`${styles.create_lot__input} ${errors.location ? styles.create_lot__input_error : ''}`}
                                    placeholder={t.location_placeholder}
                                    value={form.location}
                                    onChange={handleChange}
                                />
                                {errors.location && <span className={styles.create_lot__error}>{errors.location}</span>}
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>
                                    {t.delivery_method}<span className={styles.create_lot__label_required}>*</span>
                                </label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                                    {auctionDeliveryMethods.map((d) => (
                                        <label key={d} className={styles.create_lot__checkbox}>
                                            <input
                                                type='checkbox'
                                                checked={form.deliveryMethods.includes(d)}
                                                onChange={() => handleDeliveryMethodChange(d)}
                                            />
                                            <span className={styles.create_lot__checkbox__label}>{t[`delivery_${d}`]}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.deliveryMethods && <span className={styles.create_lot__error}>{errors.deliveryMethods}</span>}
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.delivery_payer}</label>
                                <select
                                    name='deliveryPayer'
                                    className={styles.create_lot__select}
                                    value={form.deliveryPayer}
                                    onChange={handleChange}
                                >
                                    <option value='buyer'>{t.payer_buyer}</option>
                                    <option value='seller'>{t.payer_seller}</option>
                                </select>
                            </div>
                        </div>

                        {/* ── 5. ДОДАТКОВО ── */}
                        <div className={styles.create_lot__section}>
                            <h2 className={styles.create_lot__section_title}>{t.section_additional}</h2>

                            <label className={styles.create_lot__toggle}>
                                <input
                                    type='checkbox'
                                    name='returnsAllowed'
                                    checked={form.returnsAllowed}
                                    onChange={handleChange}
                                />
                                <span className={styles.create_lot__toggle__track} />
                                <span className={styles.create_lot__toggle__label}>{t.returns}</span>
                            </label>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.guarantees}</label>
                                <textarea
                                    name='guarantees'
                                    className={styles.create_lot__textarea}
                                    placeholder={t.guarantees_placeholder}
                                    value={form.guarantees}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.buyer_comment}</label>
                                <textarea
                                    name='buyerComment'
                                    className={styles.create_lot__textarea}
                                    placeholder={t.buyer_comment_placeholder}
                                    value={form.buyerComment}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>

                            <div className={styles.create_lot__field}>
                                <label className={styles.create_lot__label}>{t.moderator_note}</label>
                                <textarea
                                    name='moderatorNote'
                                    className={styles.create_lot__textarea}
                                    placeholder={t.moderator_note_placeholder}
                                    value={form.moderatorNote}
                                    onChange={handleChange}
                                    rows={2}
                                />
                            </div>

                            <label className={styles.create_lot__checkbox}>
                                <input
                                    type='checkbox'
                                    name='confirmRules'
                                    checked={form.confirmRules}
                                    onChange={handleChange}
                                />
                                <span className={styles.create_lot__checkbox__label}>
                                    {t.confirm_rules}
                                </span>
                            </label>
                            {errors.confirmRules && <span className={styles.create_lot__error}>{errors.confirmRules}</span>}
                        </div>

                        {/* ── SUBMIT ── */}
                        <div className={styles.create_lot__submit}>
                            <button type='submit' disabled={spinner}>
                                {spinner ? t.submitting : t.submit}
                            </button>
                        </div>

                    </form>
                </div>
            </section>
        </main>
    )
}

export default CreateLotPage