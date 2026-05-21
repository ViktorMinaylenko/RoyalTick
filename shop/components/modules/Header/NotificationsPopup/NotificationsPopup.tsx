import { IWrappedComponentProps } from '@/types/hocs'
import { withClickOutside } from '@/components/hocs/withClickOutside'
import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useLang } from '@/hooks/useLang'
import NotificationItem from './NotificationItem'
import styles from '@/styles/notifications/index.module.scss'

const NotificationsPopup = forwardRef<HTMLDivElement, IWrappedComponentProps>(
    ({ open, setOpen }, ref) => {
        const { lang, translations } = useLang()
        const t = (translations[lang] as any).notifications
        const { notifications, unreadCount, markAllRead, markOneRead, clearAll } = useNotifications()

        const handleShow = () => setOpen(true)
        const handleHide = () => setOpen(false)

        return (
            <div className={styles.popup} ref={ref}>
                <button
                    className={`btn-reset ${styles.popup__btn}`}
                    onMouseEnter={handleShow}
                >
                    🔔
                    {unreadCount > 0 && (
                        <span className={styles.popup__badge}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            className={styles.popup__wrapper}
                            onMouseLeave={handleHide}
                        >
                            <span className={styles.popup__arrow} />
                            <button
                                className={`btn-reset ${styles.popup__close}`}
                                onClick={handleHide}
                            />

                            <div className={styles.popup__header}>
                                <h3 className={styles.popup__title}>{t.title}</h3>
                                <div className={styles.popup__header_actions}>
                                    {unreadCount > 0 && (
                                        <button
                                            className={`btn-reset ${styles.popup__read_all}`}
                                            onClick={markAllRead}
                                        >
                                            {t.read_all}
                                        </button>
                                    )}
                                    {notifications.length > 0 && (
                                        <button
                                            className={`btn-reset ${styles.popup__clear}`}
                                            onClick={clearAll}
                                        >
                                            {t.clear_all}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <ul className={`list-reset ${styles.popup__list}`}>
                                <AnimatePresence>
                                    {notifications.length ? (
                                        notifications.map(notification => (
                                            <motion.div
                                                key={notification._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                <NotificationItem
                                                    notification={notification}
                                                    onRead={markOneRead}
                                                />
                                            </motion.div>
                                        ))
                                    ) : (
                                        <li className={styles.popup__empty}>
                                            {t.empty}
                                        </li>
                                    )}
                                </AnimatePresence>
                            </ul>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }
)

NotificationsPopup.displayName = 'NotificationsPopup'

export default withClickOutside(NotificationsPopup)