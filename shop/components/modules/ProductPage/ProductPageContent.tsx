import styles from '@/styles/product/index.module.scss'
import { useLang } from '@/hooks/useLang'
import { useUnit } from 'effector-react'
import ProductItemActionBtn from '@/components/elements/ProductItemActionBtn/ProductItemActionBtn'
import { useFavoritesAction } from '@/hooks/useFavoritesAction'
import ProductAvailable from '@/components/elements/ProductAvailable/ProductAvailable'
import { useCartAction } from '@/hooks/useCartAction'
import { ICartItem } from '@/types/cart'
import { setIsAddToFavorites } from '@/context/favorites'
import { $currentProduct } from '@/context/goods/state'
import ProductImages from './ProductImages'
import { addOverflowHiddenToBody, capitalizeFirstLetter, formatPrice, getWatchedProductsFromLS } from '@/lib/utils/common'
import ProductSizesItem from '../ProductListItem/ProductSizesItem'
import ProductSizeTableBtn from '../ProductListItem/ProductSizeTableBtn'
import ProductCounter from '../ProductListItem/ProductCounter'
import AddToCartBtn from '../ProductListItem/AddToCartBtn'
import ProductInfoAccordion from './ProductInfoAccordion'
import ProductsByCollection from './ProductsByCollection'
import { useEffect } from 'react'
import WatchedProducts from '../WatchedProducts/WatchedProducts'
import { useWatchedProducts } from '@/hooks/useWatchedProducts'

const ProductPageContent = () => {
    const product = useUnit($currentProduct)
    const { lang, translations } = useLang()

    if (!product?._id || !product?.price) {
        return null
    }

    const {
        handleAddProductToFavorites,
        addToFavoritesSpinner,
        isProductInFavorites,
    } = useFavoritesAction(product)
    const {
        selectedSize,
        setSelectedSize,
        handleAddToCart,
        addToCartSpinner,
        updateCountSpinner,
        currentCartItems,
        allCurrentCartItemCount,
        setCount,
        existingItem,
        count,
    } = useCartAction()
    const { watchedProducts } = useWatchedProducts(product._id)

    useEffect(() => {
        const watchedProducts = getWatchedProductsFromLS()

        const isInWatched = watchedProducts.find((item) => item._id === product._id)

        if (isInWatched) {
            return
        }

        localStorage.setItem(
            'watched',
            JSON.stringify([
                ...watchedProducts,
                { category: product.category, _id: product._id },
            ])
        )
    }, [product._id, product.category])


    const handleProductShare = () => {
        addOverflowHiddenToBody()
    }

    const addToCart = () => {
        setIsAddToFavorites(false)
        handleAddToCart(count)
    }

    return (
        <>
            <div className={styles.product__top}>
                <ProductImages />
                <div className={styles.product__top__right}>
                    {(product.isBestseller || product.isNew) && (
                        <div className={styles.product__top__label}>
                            {product.isNew && (
                                <span className={styles.product__top__label__new}>
                                    {translations[lang].main_page.is_new}
                                </span>
                            )}
                            {product.isBestseller && (
                                <span className={styles.product__top__label__bestseller}>
                                    {translations[lang].main_page.is_bestseller}
                                </span>
                            )}
                        </div>
                    )}
                    <h1 className={styles.product__top__title}>{product.name}</h1>
                    <div className={styles.product__top__price}>
                        <h3 className={styles.product__top__price__title}>
                            {formatPrice(product.price)} ₴
                        </h3>
                        <div className={styles.product__top__price__inner}>
                            <div className={styles.product__top__price__favorite}>
                                <ProductItemActionBtn
                                    spinner={addToFavoritesSpinner}
                                    text={translations[lang].product.add_to_favorites}
                                    iconClass={`${addToFavoritesSpinner
                                        ? 'actions__btn_spinner'
                                        : isProductInFavorites
                                            ? 'actions__btn_favorite_checked'
                                            : 'actions__btn_favorite'
                                        }`}
                                    withTooltip={false}
                                    callback={handleAddProductToFavorites}
                                />
                            </div>
                            <button
                                className={`btn-reset ${styles.product__top__price__share}`}
                                onClick={handleProductShare}
                            />
                        </div>
                    </div>
                    <div className={styles.product__top__available}>
                        <ProductAvailable
                            vendorCode={product.vendorCode}
                            inStock={+product.inStock}
                        />
                    </div>
                    {product.characteristics.color && (
                        <div className={styles.product__composition}>
                            {translations[lang].catalog.color}:{' '}
                            <span>
                                {(translations[lang].catalog as Record<string, any>)[String(product.characteristics.color).toLowerCase()] || product.characteristics.color}
                            </span>
                        </div>
                    )}
                    {!!product.characteristics.collection && (
                        <span className={styles.product__top__collection}>
                            <span>{translations[lang].catalog.collection}:</span>{' '}
                            {capitalizeFirstLetter(String(product.characteristics.collection))}
                        </span>
                    )}
                    {product.sizes && !!Object.keys(product.sizes).length && (
                        <>
                            {selectedSize && selectedSize !== 'undefined' && (
                                <span className={styles.product__top__size}>
                                    <span>{translations[lang].catalog.size}:</span>{' '}
                                    {selectedSize.toUpperCase()}
                                </span>
                            )}
                            <ul className={`list-reset ${styles.product__top__sizes}`}>
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
                            <ProductSizeTableBtn
                                sizes={product.sizes}
                                type={product.type}
                                className={`sizes-table-btn ${styles.product__top__size_btn}`}
                            />
                        </>
                    )}
                    <div className={styles.product__top__bottom}>
                        <span className={styles.product__top__count}>
                            {translations[lang].product.count}
                        </span>
                        <div className={styles.product__top__inner}>
                            {!!selectedSize ? (
                                <ProductCounter
                                    className={`counter ${styles.product__top__counter}`}
                                    count={count}
                                    totalCount={+product.inStock}
                                    initialCount={+(existingItem?.count || 1)}
                                    setCount={setCount}
                                    cartItem={existingItem as ICartItem}
                                    updateCountAsync={false}
                                />
                            ) : (
                                <div
                                    className={`counter ${styles.product__top__counter}`}
                                    style={{ justifyContent: 'center' }}
                                >
                                    <span>
                                        {translations[lang].product.total_in_cart}{' '}
                                        {allCurrentCartItemCount}
                                    </span>
                                </div>
                            )}
                            <AddToCartBtn
                                className={styles.product__top__add}
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
                    <div className={styles.product__top__description}>
                        <ProductInfoAccordion
                            title={translations[lang].product.description}
                        >
                            <p className={styles.product__top__description__text}>
                                {product.description}
                            </p>
                        </ProductInfoAccordion>
                        <ProductInfoAccordion
                            title={translations[lang].product.characteristics}
                        >
                            <ul
                                className={`list-reset ${styles.product__top__description__characteristics}`}
                            >
                                {Object.entries(product.characteristics).map(([key, value]) => (
                                    <li
                                        key={key}
                                        className={styles.product__top__description__text}
                                    >
                                        {capitalizeFirstLetter(key)}: {value as string}
                                    </li>
                                ))}
                            </ul>
                        </ProductInfoAccordion>
                    </div>
                </div>
            </div>
            {!!product.characteristics.collection && (
                <ProductsByCollection collection={String(product.characteristics.collection)} />
            )}
            {!!watchedProducts.items?.length && (
                <WatchedProducts watchedProducts={watchedProducts} />
            )}
        </>
    )
}

export default ProductPageContent