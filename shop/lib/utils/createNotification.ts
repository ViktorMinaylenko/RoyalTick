import { ICreateNotification } from "@/types/notification"


export const createNotification = async ({
    db,
    userId,
    type,
    actorName,
    lotTitle,
    bidAmount,
    chatId,
    href,
}: ICreateNotification) => {
    await db.collection('notifications').insertOne({
        userId,
        type,
        actorName,
        lotTitle: lotTitle || '',
        bidAmount: bidAmount || null,
        chatId: chatId || null,
        href,
        isRead: false,
        createdAt: new Date(),
    })
}