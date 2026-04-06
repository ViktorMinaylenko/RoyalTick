import { useLang } from '@/hooks/useLang'
import { ICatalogFiltersProps } from '@/types/catalog'
import styles from '@/styles/catalog/index.module.scss'
import CategorySelect from './CategorySelect'
import PriceSelect from './PriceSelect'
import SizesSelect from './SizesSelect'

const CatalogFilters = ({
    handleApplyFiltersWithPrice,
    handleApplyFiltersWithSizes,
    pageName, // Отримуємо назву сторінки для визначення заголовків
}: ICatalogFiltersProps) => {
    const { lang, translations } = useLang()

    // Визначаємо заголовок залежно від поточної категорії товарів
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
                        title={getSizeTitle()} // Передаємо динамічний заголовок
                    />
                </div>
            </div>
        </div>
    )
}

export default CatalogFilters