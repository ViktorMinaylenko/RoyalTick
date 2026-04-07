import { useLang } from '@/hooks/useLang'
import { ICatalogFiltersProps } from '@/types/catalog'
import styles from '@/styles/catalog/index.module.scss'
import CategorySelect from './CategorySelect'
import PriceSelect from './PriceSelect'
import SizesSelect from './SizesSelect'
import ColorsSelect from './ColorsSelect'

const CatalogFilters = ({
    handleApplyFiltersWithPrice,
    handleApplyFiltersWithSizes,
    handleApplyFiltersWithColors,
    pageName,
}: ICatalogFiltersProps) => {
    const { lang, translations } = useLang()

    const getSizeTitle = () => {
        if (pageName === 'watches') {
            return translations[lang].catalog.case_size
        }

        if (pageName === 'straps') {
            return translations[lang].catalog.strap_size
        }

        return translations[lang].catalog.size
    }

    return (
        <div className={styles.catalog__filters}>
            <div className={styles.catalog__filters__top}>
                <div className={styles.catalog__filters__top__left}>
                    <CategorySelect />
                    <PriceSelect
                        handleApplyFiltersWithPrice={handleApplyFiltersWithPrice}
                    />
                    <SizesSelect
                        handleApplyFiltersWithSizes={handleApplyFiltersWithSizes}
                        title={getSizeTitle()}
                    />
                    {pageName !== 'straps' && (
                        <ColorsSelect
                            handleApplyFiltersWithColors={handleApplyFiltersWithColors}
                            pageName={pageName}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

export default CatalogFilters