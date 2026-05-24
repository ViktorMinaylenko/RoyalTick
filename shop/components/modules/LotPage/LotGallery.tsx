import styles from '@/styles/auction/index.module.scss'
import { ILotGalleryProps } from '@/types/auction'

const LotGallery = ({ images, activeImg, lotTitle, onThumbClick }: ILotGalleryProps) => (
    <div className={styles.lot_page__gallery}>
        <div className={styles.lot_page__gallery__main}>
            <img src={activeImg || '/img/no-image.jpg'} alt={lotTitle} />
        </div>
        {images.length > 1 && (
            <div className={styles.lot_page__gallery__thumbs}>
                {images.map((img, i) => (
                    <button
                        key={i}
                        className={`btn-reset ${styles.lot_page__gallery__thumb} ${activeImg === img ? styles.lot_page__gallery__thumb_active : ''}`}
                        onClick={() => onThumbClick(img)}
                    >
                        <img src={img} alt={`thumb-${i}`} />
                    </button>
                ))}
            </div>
        )}
    </div>
)

export default LotGallery