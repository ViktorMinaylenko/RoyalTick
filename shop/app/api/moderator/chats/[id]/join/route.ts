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

        if (user?.role !== 'moderator' && user?.role !== 'admin') {
            return NextResponse.json({ message: 'Доступ заборонено', status: 403 }, corsHeaders)
        }

        const systemMessage = {
            _id: new ObjectId(),
            senderId: 'system',
            senderName: 'system',
            text: `Модератор ${user?.name} приєднався до чату`,
            isSystem: true,
            createdAt: new Date(),
            isRead: false,
        }

        await db.collection('chats').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: { moderatorId: user?._id, moderatorName: user?.name },
                $push: { messages: systemMessage } as any,
            }
        )

        const updatedChat = await db.collection('chats').findOne({ _id: new ObjectId(id) })
        return NextResponse.json({ status: 200, chat: updatedChat }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'