'use client'
import { IProductSizesItemProps } from '@/types/goods'
import styles from '@/styles/quick-view-modal/index.module.scss'
import ProductCountBySize from './ProductCountBySize'

const ProductSizesItem = ({
  currentSize,
  selectedSize,
  setSelectedSize,
  isInStock,
  currentCartItems,
}: IProductSizesItemProps) => {
  const sizeString = String(currentSize)

  const handleSelectSize = () => {
    if (isInStock) {
      setSelectedSize(sizeString)
    }
  }

  const isSelected = selectedSize === sizeString

  return (
    <li
      className={`${styles.modal__right__info__sizes__item} ${
        !isInStock ? styles.modal__right__info__sizes__item__not_available : ''
      } ${isSelected ? styles.modal__right__info__sizes__item__selected : ''}`}
      style={{
        backgroundColor: isSelected ? '#9466FF' : 'rgba(255, 255, 255, 0.10)',
        cursor: isInStock ? 'pointer' : 'not-allowed',
        opacity: isInStock ? 1 : 0.5,
      }}
    >
      <ProductCountBySize
        size={sizeString}
        products={currentCartItems}
        withCartIcon={false}
      />
      <button
        className='btn-reset'
        onClick={handleSelectSize}
        disabled={!isInStock}
        style={{ width: '100%', height: '100%', color: 'inherit' }}
      >
        {sizeString}
      </button>
    </li>
  )
}

export default ProductSizesItem
