'use client'
import { useLang } from '@/hooks/useLang'
import { formatPrice } from '@/lib/utils/common'
import Link from 'next/link'
import styles from '@/styles/auction/index.module.scss'

interface IAuctionLot {
    _id: string
    title: string
    mainPhotoUrl: string
    currentPrice: number
    endDate: string
    bids: unknown[]
}

const AuctionLotItem = ({ lot }: { lot: IAuctionLot }) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction

    const endDate = new Date(lot.endDate)
    const formattedEnd = endDate.toLocaleString(lang === 'ua' ? 'uk-UA' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })

    return (
        <li className={styles.lot__item}>
            <Link href={`/auction/${lot._id}`} className={styles.lot__item__link}>
                <div className={styles.lot__item__img}>
                    <img
                        src={lot.mainPhotoUrl || '/img/no-image.jpg'}
                        alt={lot.title}
                    />
                    <div className={styles.lot__item__bids}>
                        <span className={styles.lot__item__bids__icon}>👥</span>
                        <span>{lot.bids.length}</span>
                    </div>
                </div>

                <div className={styles.lot__item__info}>
                    <h3 className={styles.lot__item__title}>{lot.title}</h3>
                    <span className={styles.lot__item__price}>
                        {formatPrice(lot.currentPrice)} ₴
                    </span>
                </div>

                <div className={styles.lot__item__hover}>
                    <span className={styles.lot__item__end}>
                        {t.ends} {formattedEnd}
                    </span>
                </div>
            </Link>
        </li>
    )
}

export default AuctionLotItem