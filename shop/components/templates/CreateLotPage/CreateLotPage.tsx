'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
import styles from '@/styles/auction/index.module.scss'
import { itemCategories, auctionSubcategories } from '@/constants/product'
import { auctionSaleTypes, auctionConditions, auctionDeliveryMethods, LOT_CREATION_FEE } from '@/constants/auction'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { useCreateLotForm } from '@/hooks/useCreateLotForm'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import PhotoUploadGrid from '@/components/elements/PhotoUploadGrid/PhotoUploadGrid'
import { useUnit } from 'effector-react'
import { $user } from '@/context/user/state'
import Link from 'next/link'

const CreateLotPage = () => {
    const { lang, translations } = useLang()
    const user = useUnit($user) as any
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('create_lot')
    const router = useRouter()
    const mainPhotoRef = useRef<HTMLInputElement>(null)

    const {
        mainPhoto, mainPhotoPreview,
        additionalPhotos, additionalPreviews,
        handleMainPhoto, handleAdditionalPhoto,
    } = usePhotoUpload(4)

    const {
        form, errors, spinner,
        handleChange, handleDeliveryMethodChange, handleSubmit,
    } = useCreateLotForm(mainPhoto, additionalPhotos)

    useEffect(() => {
        if (!isUserAuth()) {
            handleopenAuthModal()
            router.push('/auction')
        }
    }, [])

    const subcategoryOptions = form.category ? auctionSubcategories[form.category] || [] : []
    const hasEnoughBalance = (user?.balance || 0) >= LOT_CREATION_FEE
    const isFixedPrice = form.saleType === 'fixed_price'

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.create_lot}>
                <div className='container'>
                    <h1 className={styles.create_lot__title}>{t.create_lot}</h1>

                    <div className={styles.create_lot__layout}>

                        <form className={styles.create_lot__form} onSubmit={handleSubmit} noValidate>

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
                                    <PhotoUploadGrid
                                        count={4}
                                        previews={additionalPreviews}
                                        onChange={handleAdditionalPhoto}
                                        wrapperClassName={styles.create_lot__photo_additional}
                                        thumbClassName={styles.create_lot__photo_thumb}
                                        thumbIconClassName={styles.create_lot__photo_thumb__icon}
                                    />
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

                                {isFixedPrice ? (
                                    <div className={styles.create_lot__field}>
                                        <label className={styles.create_lot__label}>
                                            {t.fixed_price || t.start_price}<span className={styles.create_lot__label_required}>*</span>
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
                                ) : (
                                    <>
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
                                    </>
                                )}
                            </div>

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

                            <div className={styles.create_lot__submit}>
                                <button type='submit' disabled={spinner || !hasEnoughBalance}>
                                    {spinner ? t.submitting : t.submit}
                                </button>
                            </div>

                        </form>

                        <aside className={styles.create_lot__sidebar}>
                            <div className={styles.create_lot__sidebar_block}>
                                <h3 className={styles.create_lot__sidebar_title}>💳 {t.fee_title}</h3>
                                <p className={styles.create_lot__sidebar_fee}>
                                    {t.creation_fee_info} — <strong>{LOT_CREATION_FEE} ₴</strong>
                                </p>
                                <p className={styles.create_lot__sidebar_balance}>
                                    {t.your_balance}:{' '}
                                    <strong style={{ color: hasEnoughBalance ? '#52b788' : '#f87171' }}>
                                        {user?.balance || 0} ₴
                                    </strong>
                                </p>
                                {!hasEnoughBalance && (
                                    <Link href='/profile' className={styles.create_lot__sidebar_topup}>
                                        {t.creation_fee_topup} →
                                    </Link>
                                )}
                            </div>

                            <div className={styles.create_lot__sidebar_block}>
                                <h3 className={styles.create_lot__sidebar_title}>💡 {t.tips_title}</h3>
                                <ul className={styles.create_lot__sidebar_list}>
                                    <li>{t.tip_1}</li>
                                    <li>{t.tip_2}</li>
                                    <li>{t.tip_3}</li>
                                    <li>{t.tip_4}</li>
                                </ul>
                            </div>

                            <div className={styles.create_lot__sidebar_block}>
                                <h3 className={styles.create_lot__sidebar_title}>📋 {t.rules_title}</h3>
                                <ul className={styles.create_lot__sidebar_list}>
                                    <li>{t.rule_1}</li>
                                    <li>{t.rule_2}</li>
                                    <li>{t.rule_3}</li>
                                    <li>{t.rule_4}</li>
                                    <li>{t.rule_5}</li>
                                </ul>
                            </div>
                        </aside>

                    </div>
                </div>
            </section>
        </main>
    )
}

export default CreateLotPage