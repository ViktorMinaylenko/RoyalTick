import { useLang } from '@/hooks/useLang'
import { formatPrice } from '@/lib/utils/common'
import styles from '@/styles/auction/index.module.scss'
import { ILotSellerLotsProps } from '@/types/auction'

const LotSellerLots = ({ lots, sellerName }: ILotSellerLotsProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction

    if (!lots.length) return null

    return (
        <div className={styles.lot_page__seller_lots}>
            <h2 className={styles.lot_page__seller_lots__title}>
                {t.seller_lots_title} {sellerName}
            </h2>
            <div className={styles.lot_page__seller_lots__scroll}>
                {lots.map((lot) => (
                    <div key={lot._id} className={styles.lot_page__seller_lots__slide}>
                        <a href={`/auction/${lot._id}`} className={styles.lot_page__seller_lots__link}>
                            <div className={styles.lot_page__seller_lots__img}>
                                <img src={lot.mainPhotoUrl || '/img/no-image.jpg'} alt={lot.title} />
                            </div>
                            <div className={styles.lot_page__seller_lots__info}>
                                <h3 className={styles.lot_page__seller_lots__name}>{lot.title}</h3>
                                <span className={styles.lot_page__seller_lots__price}>
                                    {formatPrice(lot.currentPrice)} ₴
                                </span>
                                <span className={styles.lot_page__seller_lots__bids}>
                                    {t.bids_count}: {lot.bids.length}
                                </span>
                            </div>
                        </a>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LotSellerLots