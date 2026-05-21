import { Db } from "mongodb"

export type NotificationType = 'bid_on_lot' | 'bid_outbid' | 'new_message'

export interface INotification {
    _id: string
    userId: string
    type: NotificationType
    actorName: string
    lotTitle: string
    bidAmount: number | null
    chatId: string | null
    isRead: boolean
    createdAt: string
    href: string
}

export interface ICreateNotification {
    db: Db
    userId: any
    type: 'bid_on_lot' | 'bid_outbid' | 'new_message'
    actorName: string
    lotTitle?: string
    bidAmount?: number
    chatId?: string
    href: string
}