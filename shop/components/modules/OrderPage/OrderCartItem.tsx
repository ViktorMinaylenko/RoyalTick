import Image from 'next/image'
import { useLang } from '@/hooks/useLang'
import { formatPrice } from '@/lib/utils/common'
import { IOrderCartItemProps } from '@/types/order'
import styles from '@/styles/order/index.module.scss'

interface OrderCartItemProps extends IOrderCartItemProps {
    isMobile: boolean
}

const OrderCartItem = ({ item, position, isMobile }: OrderCartItemProps) => {
    const { lang, translations } = useLang()

    return (
        <>
            {isMobile ? (
                <li className={styles.order__list__item__list__item}>
                    <span className={styles.order__list__item__list__item__pos}>
                        {position}.
                    </span>
                    <div className={styles.order__list__item__list__item__img}>
                        <Image src={item.image} alt={item.name} width={156} height={156} />
                    </div>
                    <div className={styles.order__list__item__list__item__inner}>
                        <span className={styles.order__list__item__list__item__name}>
                            {item.name}
                        </span>
                        {item.material && (
                            <span className={styles.order__list__item__list__item__info}>
                                <span>Матеріал: </span>
                                {item.material}
                            </span>
                        )}
                        {item.size && (
                            <span className={styles.order__list__item__list__item__info}>
                                <span>{translations[lang].order.size}: </span>
                                {item.size.toUpperCase()}
                            </span>
                        )}
                        <span className={styles.order__list__item__list__item__info}>
                            <span>{translations[lang].order.count}: </span>
                            {item.count} шт.
                        </span>
                        <span className={styles.order__list__item__list__item__info}>
                            <span>{translations[lang].order.sum}: </span>
                            {formatPrice(+item.price * +item.count)} ₴
                        </span>
                    </div>
                </li>
            ) : (
                <tr>
                    <td className={styles.order__list__item__table__name}>
                        <span>{position}.</span>
                        <Image src={item.image} alt={item.name} width={109} height={109} />
                        <span>{item.name}</span>
                    </td>
                    <td className={styles.order__list__item__table__block}>
                        <span>{item.size ? item.size.toUpperCase() : '-'}</span>
                    </td>
                    <td className={styles.order__list__item__table__block}>
                        <span>{item.count} шт.</span>
                    </td>
                    <td className={styles.order__list__item__table__block}>
                        <span>{formatPrice(+item.price * +item.count)} ₴</span>
                    </td>
                </tr>
            )}
        </>
    )
}

export default OrderCartItem