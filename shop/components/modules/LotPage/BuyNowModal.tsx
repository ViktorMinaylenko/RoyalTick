import { AnimatePresence, motion } from 'framer-motion'
import { useLang } from '@/hooks/useLang'
import { formatPrice } from '@/lib/utils/common'
import styles from '@/styles/auction/index.module.scss'
import { IBuyNowModalProps } from '@/types/auction'

const BuyNowModal = ({
    show, buyNowPrice, confirmed,
    spinner, onClose, onConfirmChange, onConfirm,
}: IBuyNowModalProps) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).auction

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className={styles.buy_now_modal}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
                >
                    <motion.div
                        className={styles.buy_now_modal__inner}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                    >
                        <button
                            className={`btn-reset ${styles.buy_now_modal__close}`}
                            onClick={onClose}
                        />
                        <span className={styles.buy_now_modal__icon}>🔨</span>
                        <h2 className={styles.buy_now_modal__title}>{t.buy_now_modal_title}</h2>
                        <span className={styles.buy_now_modal__price}>
                            {formatPrice(buyNowPrice)} ₴
                        </span>
                        <p className={styles.buy_now_modal__text}>{t.buy_now_modal_text}</p>
                        <div className={styles.buy_now_modal__warning}>
                            ⚠️ {t.buy_now_modal_warning}
                        </div>
                        <label className={styles.buy_now_modal__checkbox}>
                            <input
                                type='checkbox'
                                checked={confirmed}
                                onChange={(e) => onConfirmChange(e.target.checked)}
                            />
                            <span>{t.buy_now_modal_confirm_text}</span>
                        </label>
                        <div className={styles.buy_now_modal__buttons}>
                            <button
                                className={`btn-reset ${styles.buy_now_modal__cancel}`}
                                onClick={onClose}
                            >
                                {t.buy_now_modal_cancel}
                            </button>
                            <button
                                className={`btn-reset ${styles.buy_now_modal__confirm}`}
                                onClick={onConfirm}
                                disabled={!confirmed || spinner}
                            >
                                {spinner ? '...' : t.buy_now_modal_confirm}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default BuyNowModal