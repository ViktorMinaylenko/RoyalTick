import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { createNotification } from '@/lib/utils/createNotification'
import { ObjectId } from 'mongodb'

export async function POST() {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)

        const chats = await db.collection('chats').find({
            status: 'active',
            createdAt: { $lt: threeDaysAgo },
        }).toArray()

        const inactiveChats = chats.filter(chat => {
            const winnerMessages = (chat.messages || []).filter(
                (m: any) => String(m.senderId) === String(chat.winnerId) && !m.isSystem
            )
            if (!winnerMessages.length) return true
            const lastMsg = winnerMessages[winnerMessages.length - 1]
            return new Date(lastMsg.createdAt) < threeDaysAgo
        })

        let restored = 0

        for (const chat of inactiveChats) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(String(chat.winnerId)) },
                {
                    $set: {
                        isBlocked: true,
                        blockReason: 'Автоматичне блокування: відсутність активності у чаті протягом 3 днів після перемоги в аукціоні.',
                        blockedAt: new Date(),
                        blockedBy: 'system',
                    },
                }
            )

            await db.collection('lots').updateOne(
                { _id: new ObjectId(String(chat.lotId)) },
                {
                    $set: {
                        status: 'active',
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    },
                }
            )

            const systemMessage = {
                _id: new ObjectId(),
                senderId: 'system',
                senderName: 'system',
                text: `Чат автоматично закрито. Переможець не виявив активності протягом 3 днів. Акаунт переможця заблоковано. Лот «${chat.lotTitle}» повернуто в аукціон.`,
                isSystem: true,
                createdAt: new Date(),
                isRead: false,
            }

            await db.collection('chats').updateOne(
                { _id: chat._id },
                {
                    $push: { messages: systemMessage } as any,
                    $set: { status: 'completed' },
                }
            )

            await createNotification({
                db,
                userId: chat.ownerId,
                type: 'lot_restored',
                actorName: 'Система',
                lotTitle: chat.lotTitle,
                href: `/auction/${chat.lotId}`,
            })

            await createNotification({
                db,
                userId: chat.winnerId,
                type: 'account_blocked',
                actorName: 'Система',
                lotTitle: chat.lotTitle,
                href: `/auction/${chat.lotId}`,
            })

            restored++
        }

        return NextResponse.json({ status: 200, restored }, corsHeaders)
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message, status: 500 },
            corsHeaders
        )
    }
}

export const dynamic = 'force-dynamic'