'use client'
import { useState } from 'react'
import { useUnit } from 'effector-react'
import { $sizeTableSizes } from '@/context/sizeTable'
import { $openQuickViewModal } from '@/context/modals'
import { useCartAction } from '@/hooks/useCartAction'
import { useLang } from '@/hooks/useLang'
import { closeSizeTableByCheck, isUserAuth } from '@/lib/utils/common'
import AddToCartBtn from '../ProductListItem/AddToCartBtn'
import ProductCountBySize from '../ProductListItem/ProductCountBySize'
import styles from '@/styles/size-table/index.module.scss'
import {
  $favorites,
  $favoritesFromLS,
  $isAddToFavorites,
  addProductToFavorites,
} from '@/context/favorites'
import { useGoodsByAuth } from '@/hooks/useGoodsByAuth'
import { addFavoriteItemToLS } from '@/lib/utils/favorites'
import toast from 'react-hot-toast'
import { useFavoritesAction } from '@/hooks/useFavoritesAction'

const SizeTable = () => {
  const { lang, translations } = useLang()
  const openQuickViewModal = useUnit($openQuickViewModal)
  const productSizes = useUnit($sizeTableSizes)
  const isAddToFavorites = useUnit($isAddToFavorites)

  const {
    selectedSize,
    setSelectedSize,
    product,
    handleAddToCart,
    cartItemBySize,
    addToCartSpinner,
    currentCartItems,
    updateCountSpinner,
  } = useCartAction(true)

  const { addToFavoritesSpinner, setAddToFavoritesSpinner } =
    useFavoritesAction(product)

  const currentFavoritesByAuth = useGoodsByAuth($favorites, $favoritesFromLS)

  const currentFavoriteItems = currentFavoritesByAuth.filter(
    (item) => item.productId === product._id
  )

  const [isSizeSelectedByUser, setIsSizeSelectedByUser] = useState(false)

  const isStrapsType = productSizes.type === 'straps'
  const favoriteItemBySize = currentFavoriteItems.find(
    (item) => item.size === selectedSize
  )
  const handleCloseSizeTable = () => closeSizeTableByCheck(openQuickViewModal)

  const handleSelectSize = (size: string) => {
    setSelectedSize(size)
    setIsSizeSelectedByUser(true)
  }

  const addToCart = () => handleAddToCart(+(cartItemBySize?.count || 1))

  const trProps = (
    isAvailable: boolean,
    isActive: boolean,
    onClick: () => void
  ) => ({
    onClick: isAvailable ? onClick : undefined,
    style: {
      backgroundColor: isActive ? '#9466FF' : 'transparent',
      opacity: isAvailable ? 1 : 0.3,
      color: isActive
        ? '#fff'
        : isAvailable
          ? 'inherit'
          : 'rgba(255, 255, 255, .2)',
      cursor: isAvailable ? 'pointer' : 'not-allowed',
      transition: 'all 0.2s ease',
    },
  })

  const checkInFavorites = (size: string) =>
    currentFavoriteItems.find((item) => item.size === size)

  const watchSizes = [
    {
      id: 1,
      size: '38',
      caseSize: '34–38',
      wristWidth: '50–54',
      wristGirth: '16',
      visual: translations[lang].size_table.small,
      strapWidth: '16–18',
      isInFavorites: checkInFavorites('38'),
    },
    {
      id: 2,
      size: '40',
      caseSize: '39–40',
      wristWidth: '54–58',
      wristGirth: '16–17.5',
      visual: translations[lang].size_table.medium,
      strapWidth: '18–20',
      isInFavorites: checkInFavorites('40'),
    },
    {
      id: 3,
      size: '42',
      caseSize: '41–42',
      wristWidth: '58–62',
      wristGirth: '17.5–19',
      visual: translations[lang].size_table.large,
      strapWidth: '20–22',
      isInFavorites: checkInFavorites('42'),
    },
    {
      id: 4,
      size: '44',
      caseSize: '43–44',
      wristWidth: '62–66',
      wristGirth: '19–20',
      visual: translations[lang].size_table.extra_large,
      strapWidth: '22–24',
      isInFavorites: checkInFavorites('44'),
    },
    {
      id: 5,
      size: '46',
      caseSize: '45–46',
      wristWidth: '66+',
      wristGirth: '20+',
      visual: translations[lang].size_table.extra_large,
      strapWidth: '24–26',
      isInFavorites: checkInFavorites('46'),
    },
  ]

  const getStrapGirth = (length: string) => {
    const girthMap: { [key: string]: string } = {
      '180': '16',
      '190': '16–17.5',
      '200': '17.5–19',
      '210': '19–20.5',
      '220': '20+',
    }
    return girthMap[length.trim()] || '—'
  }

  const handleAddProductToFavorites = () => {
    if (!isUserAuth()) {
      addFavoriteItemToLS(product, selectedSize)
      return
    }

    if (favoriteItemBySize) {
      toast.success('Додано в обране!')
      return
    }

    const auth = JSON.parse(localStorage.getItem('auth') as string)

    const clientId = addFavoriteItemToLS(product, selectedSize, false)

    addProductToFavorites({
      jwt: auth.accessToken,
      productId: product._id,
      setSpinner: setAddToFavoritesSpinner,
      size: selectedSize,
      category: product.category,
      clientId,
    })
  }

  return (
    <div
      className={`${styles.size_table} ${isStrapsType ? styles.size_table_straps : ''}`}
    >
      <button
        className={`btn-reset ${styles.size_table__close}`}
        onClick={handleCloseSizeTable}
      />
      <h2 className={styles.size_table__title}>
        {translations[lang].size_table.title}
      </h2>

      <div className={styles.size_table__inner}>
        {isStrapsType ? (
          <table className={styles.size_table__table}>
            <thead>
              <tr>
                <th>{translations[lang].size_table.strap_length}</th>
                <th>{translations[lang].size_table.strap_width}</th>
                <th>{translations[lang].size_table.wrist_circumference}</th>
              </tr>
            </thead>
            <tbody>
              {product.sizes &&
                Object.entries(product.sizes).map(([sizeKey, inStock]) => {
                  const [length, width] = sizeKey
                    .split('/')
                    .map((s) => s.trim())
                  const isActive = selectedSize === sizeKey
                  const isAvailable = !!inStock

                  return (
                    <tr
                      key={sizeKey}
                      {...trProps(isAvailable, isActive, () =>
                        handleSelectSize(sizeKey)
                      )}
                    >
                      <td>
                        {!!checkInFavorites(sizeKey) && (
                          <span className={styles.size_table__favorite} />
                        )}
                        {length}
                      </td>
                      <td>{width}</td>
                      <td>
                        <ProductCountBySize
                          size={sizeKey}
                          products={currentCartItems}
                        />
                        {getStrapGirth(length)}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        ) : (
          <table className={styles.size_table__table}>
            <thead>
              <tr>
                <th>{translations[lang].size_table.case_size}</th>
                <th>{translations[lang].size_table.wrist_width}</th>
                <th>{translations[lang].size_table.wrist_circumference}</th>
                <th>{translations[lang].size_table.visual_fit}</th>
                <th>{translations[lang].size_table.strap_width}</th>
              </tr>
            </thead>
            <tbody>
              {watchSizes.map((item) => {
                const isAvailable = product.sizes
                  ? !!product.sizes[item.size]
                  : false
                const isActive = selectedSize === item.size

                return (
                  <tr
                    key={`watch-${item.id}`}
                    {...trProps(isAvailable, isActive, () =>
                      handleSelectSize(item.size)
                    )}
                  >
                    <td>
                      {item.isInFavorites && (
                        <span className={styles.size_table__favorite} />
                      )}
                      {item.caseSize}
                    </td>
                    <td>{item.wristWidth}</td>
                    <td>{item.wristGirth}</td>
                    <td>{item.visual}</td>
                    <td>
                      <ProductCountBySize
                        size={item.size}
                        products={currentCartItems}
                      />
                      {item.strapWidth}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <AddToCartBtn
        className={`${styles.size_table__btn} ${styles.size_table__btn_favorite}`}
        text={
          isAddToFavorites
            ? translations[lang].product.to_favorite
            : translations[lang].product.to_cart
        }
        handleAddToCart={
          isAddToFavorites ? handleAddProductToFavorites : addToCart
        }
        addToCartSpinner={
          addToCartSpinner || updateCountSpinner || addToFavoritesSpinner
        }
        btnDisabled={
          !isSizeSelectedByUser ||
          addToCartSpinner ||
          updateCountSpinner ||
          addToFavoritesSpinner
        }
      />
    </div>
  )
}

export default SizeTable
