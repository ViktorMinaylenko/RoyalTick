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

        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const { text } = reqBody
        if (!text?.trim()) {
            return NextResponse.json({ message: 'Порожнє повідомлення', status: 400 }, corsHeaders)
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const newMessage = {
            _id: new ObjectId(),
            senderId: user?._id,
            senderName: user?.name,
            text: text.trim(),
            createdAt: new Date(),
            isRead: false,
        }

        await db.collection('chats').updateOne(
            { _id: new ObjectId(id) },
            { $set: { deletedFor: [] } }
        )

        await db.collection('chats').updateOne(
            { _id: new ObjectId(id) },
            { $push: { messages: newMessage } } as any
        )

        const updatedChat = await db.collection('chats').findOne({ _id: new ObjectId(id) })

        return NextResponse.json({ status: 200, chat: updatedChat }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'