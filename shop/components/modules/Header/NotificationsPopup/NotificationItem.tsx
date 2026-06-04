import { INotification } from '@/types/notification'
import { useLang } from '@/hooks/useLang'
import Link from 'next/link'
import styles from '@/styles/notifications/index.module.scss'
import { formatPrice } from '@/lib/utils/common'

const ICONS: Record<string, string> = {
    bid_on_lot: '🔨',
    bid_outbid: '⚡',
    new_message: '💬',
    lot_restored: '🔄',
    account_blocked: '🚫',
    topic_deleted: '🗑️',
    message_deleted: '🗑️',
}

const NotificationItem = ({
    notification,
    onRead,
}: {
    notification: INotification
    onRead: (id: string) => void
}) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).notifications

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleString(
            lang === 'ua' ? 'uk-UA' : 'en-US',
            { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }
        )

    const getTitle = () => {
        switch (notification.type) {
            case 'bid_on_lot': return t.bid_on_lot_title
            case 'bid_outbid': return t.bid_outbid_title
            case 'new_message': return t.new_message_title
            case 'lot_restored': return t.lot_restored_title
            case 'account_blocked': return t.account_blocked_title
            case 'topic_deleted': return t.topic_deleted_title
            case 'message_deleted': return t.message_deleted_title
            default: return t.notification || 'Сповіщення'
        }
    }

    const getText = () => {
        switch (notification.type) {
            case 'bid_on_lot':
                return `${notification.actorName} ${t.bid_on_lot_text} ${formatPrice(notification.bidAmount!)} ₴ — «${notification.lotTitle}»`
            case 'bid_outbid':
                return `${notification.actorName} ${t.bid_outbid_text} «${notification.lotTitle}» — ${formatPrice(notification.bidAmount!)} ₴`
            case 'new_message':
                return `${notification.actorName} ${t.new_message_text} «${notification.lotTitle}»`
            case 'lot_restored':
                return `${t.lot_restored_text} «${notification.lotTitle}»`
            case 'account_blocked':
                return t.account_blocked_text
            case 'topic_deleted': {
                const base = `${t.topic_deleted_text} «${(notification as any).topicTitle || ''}»`
                const reason = (notification as any).reason
                const punishment = (notification as any).punishment
                const reasonPart = reason ? `. ${t.reason || 'Причина'}: ${reason}` : ''
                const punishmentPart = punishment && punishment !== 'none'
                    ? `. ${t.punishment || 'Покарання'}: ${t[`punishment_${punishment}`] || punishment}`
                    : ''
                return `${base}${reasonPart}${punishmentPart}`
            }
            case 'message_deleted': {
                const base = `${t.message_deleted_text} «${(notification as any).topicTitle || ''}»`
                const reason = (notification as any).reason
                const punishment = (notification as any).punishment
                const reasonPart = reason ? `. ${t.reason || 'Причина'}: ${reason}` : ''
                const punishmentPart = punishment && punishment !== 'none'
                    ? `. ${t.punishment || 'Покарання'}: ${t[`punishment_${punishment}`] || punishment}`
                    : ''
                return `${base}${reasonPart}${punishmentPart}`
            }
            default: return ''
        }
    }

    return (
        <li className={`${styles.item} ${!notification.isRead ? styles.item_unread : ''}`}>
            <Link
                href={notification.href}
                className={styles.item__link}
                onClick={() => !notification.isRead && onRead(notification._id)}
            >
                <span className={styles.item__icon}>{ICONS[notification.type] || '🔔'}</span>
                <div className={styles.item__body}>
                    <span className={styles.item__title}>{getTitle()}</span>
                    <span className={styles.item__text}>{getText()}</span>
                    <span className={styles.item__date}>{formatDate(notification.createdAt)}</span>
                </div>
                {!notification.isRead && <span className={styles.item__dot} />}
            </Link>
        </li>
    )
}

export default NotificationItem