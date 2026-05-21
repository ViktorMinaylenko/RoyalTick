import { createStore } from 'effector'
import { INotification } from '@/types/notification'

export const $notifications = createStore<INotification[]>([])
export const $unreadCount = createStore<number>(0)