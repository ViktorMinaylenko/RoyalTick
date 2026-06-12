'use client'
import { useRouter } from 'next/navigation'
import { useLang } from '@/hooks/useLang'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { usePhotoUpload } from '@/hooks/usePhotoUpload'
import { useCreateTopic } from '@/hooks/useCreateTopic'
import styles from '@/styles/community/index.module.scss'
import auctionStyles from '@/styles/auction/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import PhotoUploadGrid from '@/components/elements/PhotoUploadGrid/PhotoUploadGrid'
import TagsInput from '@/components/elements/TagsInput/TagsInput'
import { COMMUNITY_CATEGORIES_KEYS } from '@/constants/community'

const CreateTopicPage = () => {
    const router = useRouter()
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('community')

    const CATEGORIES = COMMUNITY_CATEGORIES_KEYS.map(key => t.categories[key])

    const {
        additionalPhotos: photos,
        additionalPreviews: photoPreviews,
        handleAdditionalPhoto: handlePhotoChange,
    } = usePhotoUpload(4)

    const {
        title, setTitle,
        body, setBody,
        category, setCategory,
        tagInput, setTagInput,
        tags, spinner,
        handleAddTag,
        handleRemoveTag,
        handleSubmit,
    } = useCreateTopic(t, photos)

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.create_topic}>
                <div className='container'>
                    <h1 className={styles.create_topic__title}>{t.create_title}</h1>

                    <div className={styles.create_topic__inner}>

                        <div className={styles.create_topic__form}>
                            <div className={styles.create_topic__field}>
                                <label className={styles.create_topic__label}>
                                    {t.field_title} <span style={{ color: '#c0574a' }}>*</span>
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
                                    {t.field_category} <span style={{ color: '#c0574a' }}>*</span>
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
                                    {t.field_body} <span style={{ color: '#c0574a' }}>*</span>
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
                                <PhotoUploadGrid
                                    count={4}
                                    previews={photoPreviews}
                                    onChange={handlePhotoChange}
                                    wrapperClassName={auctionStyles.create_lot__photo_additional}
                                    thumbClassName={auctionStyles.create_lot__photo_thumb}
                                    thumbIconClassName={auctionStyles.create_lot__photo_thumb__icon}
                                />
                            </div>

                            <div className={styles.create_topic__field}>
                                <label className={styles.create_topic__label}>{t.field_tags}</label>
                                <TagsInput
                                    tags={tags}
                                    tagInput={tagInput}
                                    placeholder={t.tags_placeholder}
                                    onTagInputChange={setTagInput}
                                    onAddTag={handleAddTag}
                                    onRemoveTag={handleRemoveTag}
                                    inputClassName={styles.create_topic__input}
                                    tagClassName={styles.create_topic__tag}
                                    tagsWrapperClassName={styles.create_topic__tags}
                                />
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

                        <aside className={styles.create_topic__sidebar}>
                            <div className={styles.create_topic__tip}>
                                <p className={styles.create_topic__tip__title}>💡 {t.create_tip_title_1}</p>
                                <p className={styles.create_topic__tip__text}>{t.create_tip_text_1}</p>
                            </div>
                            <div className={styles.create_topic__tip}>
                                <p className={styles.create_topic__tip__title}>📸 {t.create_tip_title_2}</p>
                                <p className={styles.create_topic__tip__text}>{t.create_tip_text_2}</p>
                            </div>
                            <div className={styles.create_topic__tip}>
                                <p className={styles.create_topic__tip__title}>🏷 {t.create_tip_title_3}</p>
                                <p className={styles.create_topic__tip__text}>{t.create_tip_text_3}</p>
                            </div>
                            <div className={styles.create_topic__tip}>
                                <p className={styles.create_topic__tip__title}>✍️ {t.create_tip_title_4}</p>
                                <p className={styles.create_topic__tip__text}>{t.create_tip_text_4}</p>
                            </div>
                        </aside>

                    </div>
                </div>
            </section>
        </main>
    )
}

export default CreateTopicPage