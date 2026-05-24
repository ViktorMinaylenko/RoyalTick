import { createEvent } from 'effector'
import { $notifications, $unreadCount } from './state'
import { INotification } from '@/types/notification'

export const setNotifications = createEvent<INotification[]>()
export const setUnreadCount = createEvent<number>()
export const decrementUnreadCount = createEvent()

$notifications.on(setNotifications, (_, notifications) => notifications)
$unreadCount
    .on(setUnreadCount, (_, count) => count)
    .on(decrementUnreadCount, (count) => Math.max(0, count - 1))