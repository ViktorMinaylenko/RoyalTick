import { AnimatePresence } from 'framer-motion'
import { useClickOutside } from '@/hooks/useClickOutside'
import { useLang } from '@/hooks/useLang'
import styles from '@/styles/catalog/index.module.scss'
import { useCategoryFilter } from '@/hooks/useCategoryFilter'
import CategoryFilterList from './CategoryFilterList'
import SelectBtn from './SelectBtn'


const CategorySelect = () => {
    const { lang, translations } = useLang()
    const { open, ref, toggle } = useClickOutside()
    const {
        handleSelectAllCategories,
        currentOptions,
        option,
        setOption,
        allCategoriesTitle,
        catalogCategoryOptions,
    } = useCategoryFilter()

    return (
        <div className={styles.catalog__filters__select} ref={ref}>
            <SelectBtn
                open={open}
                toggle={toggle}
                bgClassName={styles.bg_category}
                defaultText={translations[lang].catalog.categories}
                dynamicText={option}
            />
            <AnimatePresence>
                {open && (
                    <CategoryFilterList
                        handleSelectAllCategories={handleSelectAllCategories}
                        currentOptions={currentOptions}
                        option={option}
                        setOption={setOption}
                        allCategoriesTitle={allCategoriesTitle}
                        catalogCategoryOptions={catalogCategoryOptions}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

export default CategorySelect