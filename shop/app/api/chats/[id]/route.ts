import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function GET(
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

        await db.collection('chats').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...(isOwner ? { unreadForOwner: false } : {}),
                    'messages.$[msg].isRead': true,
                },
            },
            {
                arrayFilters: [{ 'msg.senderId': { $ne: user?._id }, 'msg.isRead': false }],
            } as any
        )

        return NextResponse.json({ status: 200, chat }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'