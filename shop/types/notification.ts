import { Db } from "mongodb"

export type NotificationType =
    | 'bid_on_lot'
    | 'bid_outbid'
    | 'new_message'
    | 'lot_restored'
    | 'account_blocked'
    | 'topic_deleted'
    | 'message_deleted'

export interface INotification {
    _id: string
    userId: string
    type: NotificationType
    actorName: string
    lotTitle: string
    bidAmount: number | null
    chatId: string | null
    topicTitle?: string | null
    reason?: string | null
    punishment?: string | null
    isRead: boolean
    createdAt: string
    href: string
}

export interface ICreateNotification {
    db: Db
    userId: any
    type: NotificationType
    actorName: string
    lotTitle?: string
    bidAmount?: number
    chatId?: string
    topicTitle?: string
    reason?: string | null
    punishment?: string | null
    href: string
}