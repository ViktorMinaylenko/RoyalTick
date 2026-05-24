'use client'
import { useLang } from '@/hooks/useLang'
import { AUCTION_CATEGORIES, AUCTION_CONDITIONS } from '@/constants/auction'
import styles from '@/styles/auction/index.module.scss'
import { IAuctionFiltersProps } from '@/types/auction'


const AuctionFilters = ({
    sort, setSort,
    category, setCategory,
    condition, setCondition,
    minPrice, setMinPrice,
    maxPrice, setMaxPrice,
    filtersOpen, setFiltersOpen,
    hasActiveFilters,
    totalCount,
    onReset,
}: IAuctionFiltersProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction

    const SORTS = [
        { value: 'newest', label: t.sort_newest || 'Новіші' },
        { value: 'oldest', label: t.sort_oldest || 'Старіші' },
        { value: 'price_asc', label: t.sort_price_asc || 'Ціна ↑' },
        { value: 'price_desc', label: t.sort_price_desc || 'Ціна ↓' },
        { value: 'ending_soon', label: t.sort_ending_soon || 'Закінчуються' },
        { value: 'most_bids', label: t.sort_most_bids || 'Більше ставок' },
    ]

    return (
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
                        onClick={onReset}
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
                            {AUCTION_CATEGORIES.map((cat) => (
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
                            {AUCTION_CONDITIONS.map((cond) => (
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
    )
}

export default AuctionFilters