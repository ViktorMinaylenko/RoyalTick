'use client'
import { use } from 'react' // Імпортуємо use для Next.js 15
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

  console.log(products)

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