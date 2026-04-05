import styles from '@/styles/catalog/index.module.scss'
import CategorySelect from './CategorySelect'
import PriceSelect from './PriceSelect'
import { ICatalogFiltersProps } from '@/types/catalog'


const CatalogFilters = ({ handleApplyFiltersWithPrice }: ICatalogFiltersProps) => (
    <div className={styles.catalog__filters}>
        <div className={styles.catalog__filters__top}>
            <div className={styles.catalog__filters__top__left}>
                <CategorySelect />
                <PriceSelect handleApplyFiltersWithPrice={handleApplyFiltersWithPrice}/>
            </div>
        </div>
    </div>
)

export default CatalogFilters