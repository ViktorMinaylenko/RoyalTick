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

const AuctionPage = () => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('auction')
    const router = useRouter()

    const [lots, setLots] = useState([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [spinner, setSpinner] = useState(false)

    const fetchLots = async (page: number) => {
        setSpinner(true)
        try {
            const res = await fetch(`/api/auction/lots?offset=${page * LOTS_PER_PAGE}&limit=${LOTS_PER_PAGE}`)
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
        fetchLots(0)
    }, [])

    const handlePageChange = ({ selected }: { selected: number }) => {
        setCurrentPage(selected)
        fetchLots(selected)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleCreateLot = () => {
        if (!isUserAuth()) {
            handleopenAuthModal()
            return
        }
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
                                forcePage={currentPage}  // 👈 було currentPage
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