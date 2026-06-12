import Link from 'next/link'
import { formatPrice } from '@/lib/utils/common'
import styles from '@/styles/user-page/index.module.scss'
import { IPropsUserPageLots } from '@/types/lots'

const UserPageLots = ({ lots, t }: IPropsUserPageLots) => {
    if (!lots.length) return null

    return (
        <div className={styles.user_page__lots}>
            <h2 className={styles.user_page__lots_title}>
                {t.profile?.active_lots || 'Активні лоти'}
            </h2>
            <div className={styles.user_page__lots_scroll}>
                {lots.map((lot) => (
                    <div key={lot._id} className={styles.user_page__lots_slide}>
                        <Link href={`/auction/${lot._id}`} className={styles.user_page__lot_link}>
                            <div className={styles.user_page__lot_img}>
                                <img src={lot.mainPhotoUrl || '/img/no-image.jpg'} alt={lot.title} />
                            </div>
                            <div className={styles.user_page__lot_info}>
                                <h3 className={styles.user_page__lot_title}>{lot.title}</h3>
                                <span className={styles.user_page__lot_price}>{formatPrice(lot.currentPrice)} ₴</span>
                                <span className={styles.user_page__lot_bids}>
                                    {t.auction?.bids_count}: {lot.bids.length}
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default UserPageLots