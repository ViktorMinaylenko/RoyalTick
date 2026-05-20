'use client'

import { useLang } from '@/hooks/useLang'
import styles from '@/styles/product-list-item/index.module.scss'

const ProductMechanism = ({
  mechanism,
}: {
  mechanism: string | number | boolean
}) => {
  const { lang, translations } = useLang()
  const mechKey = String(mechanism)

  return (
    <span className={styles.product__color}>
      {translations[lang].product.mechanism} :{' '}
      {(translations[lang].catalog as any)[mechKey]}
    </span>
  )
}

export default ProductMechanism
