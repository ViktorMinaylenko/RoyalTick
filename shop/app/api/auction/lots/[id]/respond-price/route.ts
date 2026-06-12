import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const body = await req.json()
        const { action } = body

        const user = await findUserByEmail(db, parseJwt(token as string).email)
        const lot = await db.collection('lots').findOne({ _id: new ObjectId(id) })

        if (!lot) return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        if (String(lot.userId) !== String(user?._id)) return NextResponse.json({ message: 'Немає прав', status: 403 }, corsHeaders)
        if (!lot.priceProposal || lot.priceProposal.status !== 'pending') {
            return NextResponse.json({ message: 'Немає активної пропозиції', status: 400 }, corsHeaders)
        }

        if (action === 'decline') {
            await db.collection('lots').updateOne(
                { _id: new ObjectId(id) },
                { $set: { 'priceProposal.status': 'declined' } }
            )

            await db.collection('notifications').insertOne({
                userId: lot.priceProposal.userId,
                type: 'price_declined',
                actorName: user?.name,
                lotTitle: lot.title,
                lotId: lot._id,
                isRead: false,
                href: `/auction/${id}`,
                createdAt: new Date(),
            })

            const updatedLot = await db.collection('lots').findOne({ _id: new ObjectId(id) })
            return NextResponse.json({ status: 200, lot: updatedLot }, corsHeaders)
        }

        if (action === 'accept') {
            const proposedAmount = lot.priceProposal.amount
            const winnerId = lot.priceProposal.userId
            const winner = await db.collection('users').findOne({ _id: new ObjectId(String(winnerId)) })

            await db.collection('lots').updateOne(
                { _id: new ObjectId(id) },
                {
                    $set: {
                        currentPrice: proposedAmount,
                        status: 'reserved',
                        'priceProposal.status': 'accepted',
                    }
                }
            )

            const welcomeMessage = {
                _id: new ObjectId().toString(),
                senderId: 'system',
                senderName: 'RoyalTick',
                text: `🎉 Продавець прийняв вашу пропозицію ціни ${proposedAmount} ₴. Обговоріть деталі угоди.`,
                createdAt: new Date().toISOString(),
                isRead: false,
            }

            const chatResult = await db.collection('chats').findOneAndUpdate(
                { lotId: new ObjectId(id) },
                {
                    $setOnInsert: {
                        lotId: new ObjectId(id),
                        lotTitle: lot.title,
                        lotPhoto: lot.mainPhotoUrl,
                        winnerId: new ObjectId(String(winnerId)),
                        winnerName: winner?.name,
                        ownerId: lot.userId,
                        ownerName: lot.userName,
                        messages: [welcomeMessage],
                        status: 'active',
                        createdAt: new Date(),
                        dealCompletedByOwner: false,
                        dealCompletedByWinner: false,
                        ownerRatedBuyer: false,
                        winnerRatedSeller: false,
                        moderatorRequested: false,
                        unreadForOwner: false,
                        deletedFor: [],
                    }
                },
                { upsert: true, returnDocument: 'after' }
            )

            const chat = chatResult

            return NextResponse.json({ status: 200, chat }, corsHeaders)
        }

        return NextResponse.json({ message: 'Невідома дія', status: 400 }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'