'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isUserAuth, handleopenAuthModal } from '@/lib/utils/common'
import { useLang } from '@/hooks/useLang'
import { ITopic } from '@/types/community'
import TopicItem from '@/components/modules/CommunityPage/TopicItem'
import CategorySidebar from '@/components/modules/CommunityPage/CategorySidebar'
import styles from '@/styles/community/index.module.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'

const CommunityPage = () => {
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('community')
    const router = useRouter()
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community

    const [topics, setTopics] = useState<ITopic[]>([])
    const [count, setCount] = useState(0)
    const [spinner, setSpinner] = useState(true)
    const [category, setCategory] = useState('')

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

    useEffect(() => { fetchTopics(category) }, [category])

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
                                    <FontAwesomeIcon icon={faSpinner} spin size='2x' color='#7b2ff7' />
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