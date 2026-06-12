'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { useLang } from '@/hooks/useLang'
import { useCommunityTopics } from '@/hooks/useCommunityTopics'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import TopicItem from '@/components/modules/CommunityPage/TopicItem'
import CategorySidebar from '@/components/modules/CommunityPage/CategorySidebar'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import styles from '@/styles/community/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

const CommunityPage = () => {
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('community')
    const router = useRouter()
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community

    const [category, setCategory] = useState('')
    const { topics, count, spinner } = useCommunityTopics(category)

    const handleCreate = () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        router.push('/community/create')
    }

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.community}>
                <div className='container'>
                    <div className={styles.community__header}>
                        <h1 className={styles.community__title}>{t.title}</h1>
                        <button
                            className={`btn-reset ${styles.community__create_btn}`}
                            onClick={handleCreate}
                        >
                            + {t.create_btn}
                        </button>
                    </div>

                    <div className={styles.community__layout}>
                        <CategorySidebar active={category} onChange={setCategory} />

                        <div className={styles.community__content}>
                            <p className={styles.community__count}>
                                {count} {t.count_label}
                            </p>

                            {spinner && (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#b8973f' />
                                </div>
                            )}

                            {!spinner && (
                                <ul className={`list-reset ${styles.community__list}`}>
                                    {topics.map((topic) => (
                                        <TopicItem key={topic._id} topic={topic} />
                                    ))}
                                </ul>
                            )}

                            {!spinner && !topics.length && (
                                <p className={styles.community__empty}>{t.empty}</p>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}

export default CommunityPage