'use client'
import Link from 'next/link'
import { closeQuickViewModal } from '@/context/modals'
import { formatPrice, removeOverflowHiddenFromBody } from '@/lib/utils/common'
import QuickViewModalSlider from './QuickViewModalSlider'
import { useCartAction } from '@/hooks/useCartAction'
import { useProductImages } from '@/hooks/useProductImages'
import ProductAvailable from '@/components/elements/ProductAvailable/ProductAvailable'
import { useLang } from '@/hooks/useLang'
import ProductItemActionBtn from '@/components/elements/ProductItemActionBtn/ProductItemActionBtn'
import stylesForProduct from '@/styles/product-list-item/index.module.scss'
import styles from '@/styles/quick-view-modal/index.module.scss'
import ProductMechanism from '../ProductListItem/ProductMechanism'
import ProductCaseMaterial from '../ProductListItem/ProductCaseMaterial'
import AddToCartBtn from '../ProductListItem/AddToCartBtn'
import ProductCounter from '../ProductListItem/ProductCounter'
import ProductSizesItem from '../ProductListItem/ProductSizesItem'
import ProductSizeTableBtn from '../ProductListItem/ProductSizeTableBtn'
import { ICartItem } from '@/types/cart'

const QuickViewModal = () => {
  const { lang, translations } = useLang()
  const {
    product,
    selectedSize,
    setSelectedSize,
    handleAddToCart,
    addToCartSpinner,
    updateCountSpinner,
    allCurrentCartItemCount,
    currentCartItems,
    existingItem,
    setCount,
    count,
  } = useCartAction()
  const images = useProductImages(product)

  const char = product.characteristics || {}
  const isWatch = product.category === 'watches'
  const isStrap = product.category === 'straps'
  const isBox = product.type === 'boxes'

  const hasSizes = product.sizes && Object.keys(product.sizes).length > 0

  const handleCloseModal = () => {
    removeOverflowHiddenFromBody()
    closeQuickViewModal()
  }

  const addToCart = () => {
    handleAddToCart(count)
  }

  return (
    <div className={styles.modal}>
      <button
        className={`btn-reset ${styles.modal__close}`}
        onClick={handleCloseModal}
      />
      <div className={styles.modal__actions}>
        <ProductItemActionBtn
          text={translations[lang].product.add_to_favorites}
          iconClass='actions__btn_favorite'
          withTooltip={false}
        />
        <ProductItemActionBtn
          text={translations[lang].product.add_to_comparison}
          iconClass='actions__btn_comparison'
          withTooltip={false}
        />
      </div>
      <div className={styles.modal__left}>
        <QuickViewModalSlider images={images} />
      </div>
      <div className={styles.modal__right}>
        <h3 className={styles.modal__right__title}>{product.name}</h3>
        <div className={styles.modal__right__price}>
          {formatPrice(+product.price)} ₴
        </div>
        <div className={styles.modal__right__info}>
          <ProductAvailable
            vendorCode={product.vendorCode}
            inStock={+product.inStock}
          />

          {isWatch && (
            <>
              {char.mechanism && (
                <ProductMechanism
                  mechanism={
                    Array.isArray(char.mechanism)
                      ? char.mechanism.join(', ')
                      : (char.mechanism as string)
                  }
                />
              )}
              {char.caseMaterial && (
                <ProductCaseMaterial caseMaterial={String(char.caseMaterial)} />
              )}
            </>
          )}

          {(isStrap || isBox) && (
            <div className={styles.modal__right__info__strap}>
              {char.material && (
                <div className={stylesForProduct.product__composition}>
                  {translations[lang].catalog.material}:{' '}
                  {(translations[lang].catalog as any)[String(char.material)] ||
                    char.material}
                </div>
              )}
              {isStrap && char.claspType && (
                <div className={stylesForProduct.product__composition}>
                  {translations[lang].catalog.clasp_type}:{' '}
                  {(translations[lang].catalog as any)[
                    String(char.claspType)
                  ] || char.claspType}
                </div>
              )}
            </div>
          )}

          {hasSizes && (
            <div className={styles.modal__right__info__size}>
              <div className={styles.modal__right__info__size__inner}>
                <span className={stylesForProduct.product__size_title}>
                  {/* ВИПРАВЛЕНО: Використовуємо існуючі ключі перекладу */}
                  {isWatch
                    ? translations[lang].catalog.case_size
                    : translations[lang].catalog.strap_size}
                </span>

                <ProductSizeTableBtn
                  sizes={product.sizes}
                  type={product.category}
                  className={`sizes-table-btn ${styles.modal__right__info__sizes_btn}`}
                />
              </div>

              <div className={styles.modal__right__info__sizes_list}>
                <ul
                  className={`list-reset ${styles.modal__right__info__sizes}`}
                >
                  {Object.entries(product.sizes).map(([size, isInStock]) => (
                    <ProductSizesItem
                      key={size}
                      currentSize={size}
                      selectedSize={selectedSize}
                      setSelectedSize={setSelectedSize}
                      currentCartItems={currentCartItems}
                      isInStock={isInStock as boolean}
                    />
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className={styles.modal__right__bottom}>
            <span className={stylesForProduct.product__count_title}>
              {translations[lang].product.count}
            </span>
            <div className={styles.modal__right__bottom__inner}>
              {isBox || !!selectedSize ? (
                <ProductCounter
                  className={`counter ${styles.modal__right__bottom__counter}`}
                  count={count}
                  totalCount={+product.inStock}
                  initialCount={+(existingItem?.count || 1)}
                  setCount={setCount}
                  cartItem={existingItem as ICartItem}
                  updateCountAsync={false}
                />
              ) : (
                <div
                  className={`counter ${styles.modal__right__bottom__counter}`}
                  style={{ justifyContent: 'center', fontSize: '12px' }}
                >
                  <span>{translations[lang].product.total_in_cart}{' '}
                    {allCurrentCartItemCount}
                  </span>
                </div>
              )}
              <AddToCartBtn
                className={styles.modal__right__bottom__add}
                text={translations[lang].product.to_cart}
                handleAddToCart={addToCart}
                addToCartSpinner={addToCartSpinner || updateCountSpinner}
                btnDisabled={
                  addToCartSpinner ||
                  updateCountSpinner ||
                  allCurrentCartItemCount === +product.inStock
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.modal__right__more}>
          <Link
            href={`/catalog/${product.category}/${product._id}`}
            className={styles.modal__right__more__link}
            onClick={handleCloseModal}
          >
            {translations[lang].product.more}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuickViewModal
