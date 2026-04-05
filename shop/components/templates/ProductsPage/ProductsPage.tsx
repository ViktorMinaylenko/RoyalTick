'use client'
import { use, useEffect } from 'react' // Імпортуємо use для Next.js 15
import { useProductFilters } from "@/hooks/useProductFilters"
import { IProductsPage, SearchParams } from "@/types/catalog"
import ReactPaginate from 'react-paginate'
import styles from '@/styles/catalog/index.module.scss'
import skeletonStyles from '@/styles/skeleton/index.module.scss'
import { motion } from "framer-motion"
import { basePropsForMotion } from "@/constants/motion"
import ProductListItem from '@/components/modules/ProductListItem/ProductListItem'
import { useLang } from '@/hooks/useLang'
import HeadingWithCount from '@/components/elements/HeadingWithCount/HeadingWithCount'
import {setCatalogCategoryOptions } from '@/context/catalog'
import CatalogFilters from '@/components/modules/CatalogFilters/CatalogFilters'

const ProductsPage = ({ searchParams, pageName }: IProductsPage) => {
  const { lang, translations } = useLang()
  const resolvedSearchParams = use(searchParams as any) as SearchParams

  const {
    products,
    productsSpinner,
    paginationProps,
    handlePageChange,
    handleApplyFiltersWithCategory,
    handleApplyFiltersWithPrice,
    handleApplyFiltersWithSizes,
    handleApplyFiltersWithColors,
    handleApplyFiltersBySort,
  } = useProductFilters(
    resolvedSearchParams,
    pageName,
    pageName === 'catalog'
  )

  useEffect(() => {
    if (!translations[lang]) return

    switch (pageName) {
      case 'catalog':
        setCatalogCategoryOptions({
          rootCategoryOptions: [
            { id: 1, title: translations[lang].main_menu.watches, href: '/catalog/watches' },
            { id: 2, title: translations[lang].main_menu.straps, href: '/catalog/straps' },
            { id: 3, title: translations[lang].main_menu.boxes, href: '/catalog/boxes' },
            { id: 4, title: translations[lang].main_menu.care, href: '/catalog/care' },
          ],
        })
        break

      case 'watches':
        setCatalogCategoryOptions({
          watchesCategoryOptions: [
            {
              id: 1,
              title: translations[lang].comparison.classic_watches,
              filterHandler: () => handleApplyFiltersWithCategory('classic'),
            },
            {
              id: 2,
              title: translations[lang].comparison.premium_watches,
              filterHandler: () => handleApplyFiltersWithCategory('premium'),
            },
            {
              id: 3,
              title: translations[lang].comparison.sport_watches,
              filterHandler: () => handleApplyFiltersWithCategory('sport'),
            },
            {
              id: 4,
              title: translations[lang].comparison.line_watches,
              filterHandler: () => handleApplyFiltersWithCategory('line'),
            },
          ],
        })
        break

      case 'straps':
        setCatalogCategoryOptions({
          strapsCategoryOptions: [
            {
              id: 1,
              title: translations[lang].comparison.leather_strap,
              filterHandler: () => handleApplyFiltersWithCategory('leather_strap'),
            },
            {
              id: 2,
              title: translations[lang].comparison.metal_bracelet,
              filterHandler: () => handleApplyFiltersWithCategory('metal_bracelet'),
            },
            {
              id: 3,
              title: translations[lang].comparison.rubber_strap,
              filterHandler: () => handleApplyFiltersWithCategory('rubber_strap'),
            },
            {
              id: 4,
              title: translations[lang].comparison.nato_strap,
              filterHandler: () => handleApplyFiltersWithCategory('nato_strap'),
            },
            {
              id: 5,
              title: translations[lang].comparison.mesh_bracelet,
              filterHandler: () => handleApplyFiltersWithCategory('mesh_bracelet'),
            },
          ],
        })
        break

      case 'boxes':
        setCatalogCategoryOptions({
          boxesCategoryOptions: [
            {
              id: 1,
              title: translations[lang].comparison.boxes,
              filterHandler: () => handleApplyFiltersWithCategory('boxes'),
            },
          ],
        })
        break

      case 'care':
        setCatalogCategoryOptions({
          careCategoryOptions: [
            {
              id: 1,
              title: translations[lang].comparison.basic,
              filterHandler: () => handleApplyFiltersWithCategory('basic'),
            },
            {
              id: 2,
              title: translations[lang].comparison.professional,
              filterHandler: () => handleApplyFiltersWithCategory('professional'),
            },
          ],
        })
        break

      default:
        break
    }
  }, [lang, pageName, translations, handleApplyFiltersWithCategory])

  return (
    <>
      <HeadingWithCount
        count={products.count}
        title={
          (translations[lang].breadcrumbs as { [index: string]: string })[
          pageName
          ]
        }
        spinner={productsSpinner}
      />
      <CatalogFilters handleApplyFiltersWithPrice={handleApplyFiltersWithPrice} />
      {productsSpinner && (
        <motion.ul
          {...basePropsForMotion}
          className={skeletonStyles.skeleton}
          style={{ marginBottom: 60 }}
        >
          {Array.from(new Array(12)).map((_, index) => (
            <li key={index} className={skeletonStyles.skeleton__item}>
              <div className={skeletonStyles.skeleton__item__light}></div>
            </li>
          ))}
        </motion.ul>
      )}
      {!productsSpinner && (
        <motion.ul
          {...basePropsForMotion}
          className={`list-reset ${styles.catalog__list}`}
        >
          {(products.items || []).map((item) => (
            <ProductListItem key={item._id} item={item} />
          ))}
        </motion.ul>
      )}
      {!products.items?.length && !productsSpinner && (
        <div className={styles.catalog__list__empty}>
          {translations[lang].common.nothing_is_found}
        </div>
      )}

      <div className={styles.catalog__bottom}>
        {products.count > 12 && (
          <ReactPaginate {...paginationProps} nextLabel={translations[lang].catalog.next_page} previousLabel={translations[lang].catalog.previous_page} onPageChange={handlePageChange} />
        )}
      </div>
    </>
  )
}

export default ProductsPage