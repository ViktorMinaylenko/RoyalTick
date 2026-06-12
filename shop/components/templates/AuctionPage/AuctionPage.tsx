'use client'
import Breadcrumbs from '@/components/modules/Breadcrumbs/Breadcrumbs'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import { useLang } from '@/hooks/useLang'
import { handleopenAuthModal, isUserAuth } from '@/lib/utils/common'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import ReactPaginate from 'react-paginate'
import styles from '@/styles/auction/index.module.scss'
import AuctionLotItem from '@/components/modules/AuctionPage/AuctionLotItem'
import AuctionFilters from '@/components/modules/AuctionPage/AuctionFilters'
import skeletonStyles from '@/styles/skeleton/index.module.scss'
import { motion } from 'framer-motion'
import { basePropsForMotion } from '@/constants/motion'
import { useAuctionFilters } from '@/hooks/useAuctionFilters'
import { useAuctionInit } from '@/hooks/useAuctionInit'
import { LOTS_PER_PAGE } from '@/constants/auction'

const AuctionPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const router = useRouter()

    const {
        lots, totalCount, currentPage, spinner,
        category, setCategory,
        condition, setCondition,
        minPrice, setMinPrice,
        maxPrice, setMaxPrice,
        sort, setSort,
        filtersOpen, setFiltersOpen,
        hasActiveFilters,
        fetchLots, handleReset, handlePageChange,
    } = useAuctionFilters()

    useAuctionInit(() => fetchLots(0))

    useEffect(() => {
        fetchLots(0)
    }, [category, condition, minPrice, maxPrice, sort])

    const handleCreateLot = () => {
        if (!isUserAuth()) { handleopenAuthModal(); return }
        router.push('/auction/create')
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

                    <AuctionFilters
                        sort={sort} setSort={setSort}
                        category={category} setCategory={setCategory}
                        condition={condition} setCondition={setCondition}
                        minPrice={minPrice} setMinPrice={setMinPrice}
                        maxPrice={maxPrice} setMaxPrice={setMaxPrice}
                        filtersOpen={filtersOpen} setFiltersOpen={setFiltersOpen}
                        hasActiveFilters={hasActiveFilters}
                        totalCount={totalCount}
                        onReset={handleReset}
                    />

                    {spinner && (
                        <motion.ul {...basePropsForMotion} className={skeletonStyles.skeleton}>
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