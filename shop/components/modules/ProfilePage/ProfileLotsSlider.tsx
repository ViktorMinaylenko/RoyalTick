'use client'
import Link from 'next/link'
import { useLang } from '@/hooks/useLang'
import { formatPrice } from '@/lib/utils/common'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/profile/index.module.scss'
import { IProfileLotsSliderProps } from '@/types/lots'

const ProfileLotsSlider = ({
    title,
    lots,
    spinner,
    allLink,
    emptyText,
}: IProfileLotsSliderProps) => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any

    return (
        <div className={styles.profile__lots_section}>
            <div className={styles.profile__lots_section__header}>
                <h2 className={styles.profile__lots_section__title}>{title}</h2>
                <Link href={allLink} className={styles.profile__lots_section__all}>
                    {t.common?.all_link} ↘
                </Link>
            </div>

            {spinner && (
                <div className={styles.profile__lots_section__spinner}>
                    <FontAwesomeIcon icon={faSpinner} spin color='#52b788' />
                </div>
            )}

            {!spinner && !lots.length && (
                <p className={styles.profile__lots_section__empty}>{emptyText}</p>
            )}

            {!spinner && !!lots.length && (
                <div className={styles.profile__lots_section__scroll}>
                    {lots.map((lot) => (
                        <div key={lot._id} className={styles.profile__lots_section__slide}>
                            <Link href={`/auction/${lot._id}`} className={styles.profile__lots_slide__link}>
                                <div className={styles.profile__lots_slide__img}>
                                    <img src={lot.mainPhotoUrl || '/img/no-image.jpg'} alt={lot.title} />
                                    <span className={`${styles.profile__lots_slide__status} ${styles[`profile__lots_slide__status_${lot.status}`]}`}>
                                        {lot.status === 'active' && (t.profile?.lot_active || 'Активний')}
                                        {lot.status === 'reserved' && (t.profile?.lot_reserved || 'Резерв')}
                                        {lot.status === 'completed' && (t.profile?.lot_ended || 'Завершено')}
                                    </span>
                                </div>
                                <div className={styles.profile__lots_slide__info}>
                                    <h3 className={styles.profile__lots_slide__title}>{lot.title}</h3>
                                    <span className={styles.profile__lots_slide__price}>
                                        {formatPrice(lot.currentPrice)} ₴
                                    </span>
                                    <span className={styles.profile__lots_slide__bids}>
                                        {t.auction?.bids_count}: {lot.bids.length}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProfileLotsSlider