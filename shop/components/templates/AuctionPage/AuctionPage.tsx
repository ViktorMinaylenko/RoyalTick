'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { handleopenAuthModal, isUserAuth } from '@/lib/utils/common'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ReactPaginate from 'react-paginate'
import styles from '@/styles/auction/index.module.scss'
import AuctionLotItem from '@/components/modules/AuctionPage/AuctionLotItem'
import skeletonStyles from '@/styles/skeleton/index.module.scss'
import { motion } from 'framer-motion'
import { basePropsForMotion } from '@/constants/motion'

const LOTS_PER_PAGE = 12
const CATEGORIES = ['watches', 'straps', 'boxes', 'care']
const CONDITIONS = ['new', 'like_new', 'good', 'used', 'for_parts']

const AuctionPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const router = useRouter()

    const SORTS = [
        { value: 'newest', label: t.sort_newest || 'Новіші' },
        { value: 'oldest', label: t.sort_oldest || 'Старіші' },
        { value: 'price_asc', label: t.sort_price_asc || 'Ціна ↑' },
        { value: 'price_desc', label: t.sort_price_desc || 'Ціна ↓' },
        { value: 'ending_soon', label: t.sort_ending_soon || 'Закінчуються' },
        { value: 'most_bids', label: t.sort_most_bids || 'Більше ставок' },
    ]

    const [lots, setLots] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [spinner, setSpinner] = useState(false)

    const [category, setCategory] = useState('')
    const [condition, setCondition] = useState('')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const [sort, setSort] = useState('newest')
    const [filtersOpen, setFiltersOpen] = useState(false)

    const buildQuery = (page: number) => {
        const params = new URLSearchParams()
        params.set('offset', String(page * LOTS_PER_PAGE))
        params.set('limit', String(LOTS_PER_PAGE))
        params.set('sort', sort)
        if (category) params.set('category', category)
        if (condition) params.set('condition', condition)
        if (minPrice) params.set('minPrice', minPrice)
        if (maxPrice) params.set('maxPrice', maxPrice)
        return params.toString()
    }

    const fetchLots = async (page: number) => {
        setSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots?${buildQuery(page)}`)
            const data = await res.json()
            if (data.status === 200) {
                setLots(data.lots)
                setTotalCount(data.count)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSpinner(false)
        }
    }

    useEffect(() => {
        fetch('/api/auction/lots/finalize', { method: 'POST' }).catch(console.error)
        fetchLots(0)
    }, [])

    useEffect(() => {
        setCurrentPage(0)
        fetchLots(0)
    }, [category, condition, minPrice, maxPrice, sort])

    const handlePageChange = ({ selected }: { selected: number }) => {
        setCurrentPage(selected)
        fetchLots(selected)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCreateLot = () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        router.push('/auction/create')
    }

    const hasActiveFilters = !!(category || condition || minPrice || maxPrice || sort !== 'newest')

    const handleReset = () => {
        setCategory('')
        setCondition('')
        setMinPrice('')
        setMaxPrice('')
        setSort('newest')
    }

    return (
        <main>
            <Breadcrumbs
                getDefaultTextGenerator={getDefaultTextGenerator}
                getTextGenerator={getTextGenerator}
            />
            <section className={styles.auction}>
                <div className='container'>

                    <div className={styles.auction__header}>
                        <h1 className={styles.auction__title}>
                            {translations[lang].main_menu.auction}
                        </h1>
                        <button
                            className={`btn-reset ${styles.auction__create_btn}`}
                            onClick={handleCreateLot}
                        >
                            <span className={styles.auction__create_btn__icon}>+</span>
                            {t.create_lot}
                        </button>
                    </div>

                    <div className={styles.auction__filters}>

                        <div className={styles.auction__filters__sort}>
                            {SORTS.map((s) => (
                                <button
                                    key={s.value}
                                    className={`btn-reset ${styles.auction__filters__sort_btn} ${sort === s.value ? styles.auction__filters__sort_btn_active : ''}`}
                                    onClick={() => setSort(s.value)}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.auction__filters__row}>
                            <button
                                className={`btn-reset ${styles.auction__filters__toggle} ${filtersOpen ? styles.auction__filters__toggle_open : ''}`}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                            >
                                ⚙ {t.filters_btn || 'Фільтри'}
                                {hasActiveFilters && !filtersOpen && (
                                    <span className={styles.auction__filters__dot} />
                                )}
                            </button>

                            {hasActiveFilters && (
                                <button
                                    className={`btn-reset ${styles.auction__filters__reset}`}
                                    onClick={handleReset}
                                >
                                    ✕ {t.filters_reset || 'Скинути'}
                                </button>
                            )}

                            <span className={styles.auction__filters__count}>
                                {totalCount} {t.lots_count_label || 'лотів'}
                            </span>
                        </div>

                        {filtersOpen && (
                            <div className={styles.auction__filters__panel}>

                                <div className={styles.auction__filters__group}>
                                    <span className={styles.auction__filters__group_label}>
                                        {t.filter_category || 'Категорія'}
                                    </span>
                                    <div className={styles.auction__filters__chips}>
                                        <button
                                            className={`btn-reset ${styles.auction__filters__chip} ${!category ? styles.auction__filters__chip_active : ''}`}
                                            onClick={() => setCategory('')}
                                        >
                                            {t.filter_all || 'Всі'}
                                        </button>
                                        {CATEGORIES.map((cat) => (
                                            <button
                                                key={cat}
                                                className={`btn-reset ${styles.auction__filters__chip} ${category === cat ? styles.auction__filters__chip_active : ''}`}
                                                onClick={() => setCategory(cat === category ? '' : cat)}
                                            >
                                                {t[`category_${cat}`] || cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.auction__filters__group}>
                                    <span className={styles.auction__filters__group_label}>
                                        {t.filter_condition || 'Стан товару'}
                                    </span>
                                    <div className={styles.auction__filters__chips}>
                                        <button
                                            className={`btn-reset ${styles.auction__filters__chip} ${!condition ? styles.auction__filters__chip_active : ''}`}
                                            onClick={() => setCondition('')}
                                        >
                                            {t.filter_all || 'Всі'}
                                        </button>
                                        {CONDITIONS.map((cond) => (
                                            <button
                                                key={cond}
                                                className={`btn-reset ${styles.auction__filters__chip} ${condition === cond ? styles.auction__filters__chip_active : ''}`}
                                                onClick={() => setCondition(cond === condition ? '' : cond)}
                                            >
                                                {t[`condition_${cond}`] || cond}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.auction__filters__group}>
                                    <span className={styles.auction__filters__group_label}>
                                        {t.filter_price || 'Ціна (₴)'}
                                    </span>
                                    <div className={styles.auction__filters__price}>
                                        <input
                                            type='number'
                                            placeholder={t.price_from || 'Від'}
                                            value={minPrice}
                                            onChange={e => setMinPrice(e.target.value)}
                                            className={styles.auction__filters__price_input}
                                        />
                                        <span className={styles.auction__filters__price_sep}>—</span>
                                        <input
                                            type='number'
                                            placeholder={t.price_to || 'До'}
                                            value={maxPrice}
                                            onChange={e => setMaxPrice(e.target.value)}
                                            className={styles.auction__filters__price_input}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}
                    </div>

                    {spinner && (
                        <motion.ul
                            {...basePropsForMotion}
                            className={skeletonStyles.skeleton}
                        >
                            {Array.from(new Array(12)).map((_, i) => (
                                <li key={i} className={skeletonStyles.skeleton__item}>
                                    <div className={skeletonStyles.skeleton__item__light} />
                                </li>
                            ))}
                        </motion.ul>
                    )}

                    {!spinner && (
                        <motion.ul
                            {...basePropsForMotion}
                            className={`list-reset ${styles.auction__list}`}
                        >
                            {lots.map((lot: any) => (
                                <AuctionLotItem key={lot._id} lot={lot} />
                            ))}
                        </motion.ul>
                    )}

                    {!lots.length && !spinner && (
                        <p className={styles.auction__empty}>
                            {translations[lang].common.nothing_is_found}
                        </p>
                    )}

                    {totalCount > LOTS_PER_PAGE && (
                        <div className={styles.auction__pagination}>
                            <ReactPaginate
                                pageCount={Math.ceil(totalCount / LOTS_PER_PAGE)}
                                forcePage={currentPage}
                                onPageChange={handlePageChange}
                                nextLabel={translations[lang].catalog.next_page}
                                previousLabel={translations[lang].catalog.previous_page}
                                containerClassName='paginate-container'
                                activeClassName='paginate-active'
                            />
                        </div>
                    )}

                </div>
            </section>
        </main>
    )
}

export default AuctionPage