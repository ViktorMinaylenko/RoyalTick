import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST() {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)

        const expiredLots = await db.collection('lots').find({
            status: 'active',
            endDate: { $lt: new Date() },
            'bids.0': { $exists: true },
        }).toArray()

        let finalized = 0

        for (const lot of expiredLots) {
            const winnerBid = lot.bids[lot.bids.length - 1]

            const winner = await db.collection('users').findOne({
                _id: new ObjectId(String(winnerBid.userId)),
            })

            if (winner) {
                const welcomeMessage = {
                    _id: new ObjectId(),
                    senderId: lot.userId,
                    senderName: lot.userName,
                    text: 'Вітаю! Ви перемогли в аукціоні. Давайте домовимось про доставку.',
                    createdAt: new Date(),
                    isRead: false,
                }

                await db.collection('chats').updateOne(
                    { lotId: lot._id },
                    {
                        $setOnInsert: {
                            lotId: lot._id,
                            lotTitle: lot.title,
                            lotPhoto: lot.mainPhotoUrl,
                            winnerId: winner._id,
                            winnerName: winner.name,
                            ownerId: lot.userId,
                            ownerName: lot.userName,
                            messages: [welcomeMessage],
                            createdAt: new Date(),
                            status: 'active',
                            unreadForOwner: true,
                        },
                    },
                    { upsert: true }
                )

                finalized++
            }

            await db.collection('lots').updateOne(
                { _id: lot._id },
                { $set: { status: 'reserved' } }
            )
        }

        return NextResponse.json({ status: 200, finalized }, corsHeaders)
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message, status: 500 },
            corsHeaders
        )
    }
}

export const dynamic = 'force-dynamic'