import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; msgId: string }> }
) {
    try {
        const { id, msgId } = await params
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const moderator = await findUserByEmail(db, parseJwt(token as string).email)

        if (!moderator || !['moderator', 'admin'].includes(moderator.role)) {
            return NextResponse.json({ message: 'Доступ заборонено', status: 403 }, corsHeaders)
        }

        const topic = await db.collection('topics').findOne({ _id: new ObjectId(id) })
        if (!topic) {
            return NextResponse.json({ message: 'Тему не знайдено', status: 404 }, corsHeaders)
        }

        const message = topic.messages?.find(
            (m: any) => String(m._id) === msgId
        )
        if (!message) {
            return NextResponse.json({ message: 'Повідомлення не знайдено', status: 404 }, corsHeaders)
        }

        await db.collection('topics').updateOne(
            { _id: new ObjectId(id) },
            { $pull: { messages: { _id: new ObjectId(msgId) } } } as any
        )

        await db.collection('notifications').insertOne({
            userId: message.userId,
            type: 'message_deleted',
            actorName: moderator.name,
            topicTitle: topic.title,
            reason: reqBody?.reason || null,
            punishment: reqBody?.punishment || null,
            isRead: false,
            createdAt: new Date(),
            href: '/community',
        })

        const updated = await db.collection('topics').findOne({ _id: new ObjectId(id) })
        return NextResponse.json({ status: 200, topic: updated }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'