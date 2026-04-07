import { useLang } from '@/hooks/useLang'
import { ICatalogFiltersProps } from '@/types/catalog'
import styles from '@/styles/catalog/index.module.scss'
import CategorySelect from './CategorySelect'
import PriceSelect from './PriceSelect'
import SizesSelect from './SizesSelect'
import ColorsSelect from './ColorsSelect'
import SortSelect from './SortSelect'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { motion } from 'framer-motion'
import { $colorsOptions, $sizesOptions, setColors, setColorsOptions, setSizes, setSizesOptions } from '@/context/catalog'
import { useUnit } from 'effector-react'
import { basePropsForMotion } from '@/constants/motion'
import { addOverflowHiddenToBody } from '@/lib/utils/common'
import SelectInfoItem from './SelectInfoItem'

const CatalogFilters = ({
    handleApplyFiltersWithPrice,
    handleApplyFiltersWithSizes,
    handleApplyFiltersWithColors,
    handleApplyFiltersBySort,
    pageName,
}: ICatalogFiltersProps) => {
    const { lang, translations } = useLang()
    const sizesOptions = useUnit($sizesOptions)
    const colorsOptions = useUnit($colorsOptions)
    const isMedia910 = useMediaQuery(910)
    const isMedia610 = useMediaQuery(610)

    const handleRemoveSizeOption = (id: number) => {
        const updatedOptions = sizesOptions.map((item) =>
            item.id === id ? { ...item, checked: false } : item
        )

        setSizesOptions(updatedOptions)

        const updatedSizes = updatedOptions
            .filter((item) => item.checked)
            .map((item) => item.size)

        setSizes(updatedSizes)
        handleApplyFiltersWithSizes(updatedSizes)
    }

    const handleRemoveColorOption = (id: number) => {
        const updatedOptions = colorsOptions.map((item) =>
            item.id === id ? { ...item, checked: false } : item
        )

        setColorsOptions(updatedOptions)

        const updatedColorsByText = updatedOptions
            .filter((item) => item.checked)
            .map(({ colorText }) => colorText)

        const updatedColorsByCode = updatedOptions
            .filter((item) => item.checked)
            .map(({ colorCode }) => colorCode)

        setColors(updatedColorsByText)
        handleApplyFiltersWithColors(updatedColorsByCode)
    }

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
                {!isMedia610 && (
                    <>
                        <div className={styles.catalog__filters__top__left}>
                            <CategorySelect />
                            {isMedia910 && (
                                <SizesSelect
                                    handleApplyFiltersWithSizes={handleApplyFiltersWithSizes}
                                    title={getSizeTitle()}
                                />
                            )}
                            <PriceSelect
                                handleApplyFiltersWithPrice={handleApplyFiltersWithPrice}
                            />
                        </div>
                        {!isMedia910 && (
                            <SizesSelect
                                handleApplyFiltersWithSizes={handleApplyFiltersWithSizes}
                                title={getSizeTitle()}
                            />
                        )}
                        <div className={styles.catalog__filters__top__right}>
                            {pageName !== 'straps' && (
                                <ColorsSelect
                                    handleApplyFiltersWithColors={handleApplyFiltersWithColors}
                                    pageName={pageName}
                                />
                            )}
                            <SortSelect
                                handleApplyFiltersBySort={handleApplyFiltersBySort}
                            />
                        </div>
                    </>
                )}
                {isMedia610 && (
                    <>
                        <SortSelect
                            handleApplyFiltersBySort={handleApplyFiltersBySort}
                        />
                        <button className={`btn-reset ${styles.catalog__filters__top__filter_btn}`} />
                    </>
                )}
            </div>
            <div className={styles.catalog__filters__bottom}>
                <motion.ul
                    className={`list-reset ${styles.catalog__filters__bottom__list}`}
                    {...basePropsForMotion}
                >
                    {sizesOptions
                        .filter((item) => item.checked)
                        .map((item) => (
                            <SelectInfoItem
                                key={item.id}
                                id={item.id}
                                text={item.size}
                                handleRemoveItem={handleRemoveSizeOption}
                            />
                        ))}
                    {colorsOptions
                        .filter((item) => item.checked)
                        .map((item) => (
                            <SelectInfoItem
                                key={item.id}
                                id={item.id}
                                text={item.colorText}
                                handleRemoveItem={handleRemoveColorOption}
                            />
                        ))}
                </motion.ul>
            </div>
        </div>
    )
}

export default CatalogFilters