import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const user = await findUserByEmail(db, parseJwt(token as string).email)
        const chat = await db.collection('chats').findOne({ _id: new ObjectId(id) })

        if (!chat) {
            return NextResponse.json({ message: 'Чат не знайдено', status: 404 }, corsHeaders)
        }

        const isOwner = String(chat.ownerId) === String(user?._id)
        const isWinner = String(chat.winnerId) === String(user?._id)

        if (!isOwner && !isWinner) {
            return NextResponse.json({ message: 'Немає доступу', status: 403 }, corsHeaders)
        }

        const updateField = isOwner ? 'dealCompletedByOwner' : 'dealCompletedByWinner'

        await db.collection('chats').updateOne(
            { _id: new ObjectId(id) },
            { $set: { [updateField]: true } }
        )

        const updatedChat = await db.collection('chats').findOne({ _id: new ObjectId(id) })

        if (updatedChat?.dealCompletedByOwner && updatedChat?.dealCompletedByWinner) {
            await db.collection('chats').updateOne(
                { _id: new ObjectId(id) },
                { $set: { status: 'completed' } }
            )
            await db.collection('lots').updateOne(
                { _id: chat.lotId },
                { $set: { status: 'completed' } }
            )
        }

        const finalChat = await db.collection('chats').findOne({ _id: new ObjectId(id) })
        return NextResponse.json({ status: 200, chat: finalChat }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'