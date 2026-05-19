import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import {
    getDbAndReqBody,
    isValidAccessToken,
    parseJwt,
    findUserByEmail,
} from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const chats = await db.collection('chats').find({
            $or: [
                { winnerId: user?._id },
                { ownerId: user?._id },
            ],
            deletedFor: { $nin: [user?._id] },
        }).sort({ createdAt: -1 }).toArray()

        return NextResponse.json({ status: 200, chats }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export async function POST(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const { lotId } = reqBody

        const existingChat = await db.collection('chats').findOne({
            lotId: new ObjectId(lotId),
        })
        if (existingChat) {
            return NextResponse.json({ status: 200, chat: existingChat }, corsHeaders)
        }

        const lot = await db.collection('lots').findOne({ _id: new ObjectId(lotId) })
        if (!lot) {
            return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const welcomeMessage = {
            _id: new ObjectId(),
            senderId: lot.userId,
            senderName: lot.userName,
            text: 'Вітаю! Ви перемогли в аукціоні. Давайте домовимось про доставку.',
            createdAt: new Date(),
            isRead: false,
        }

        const newChat = {
            lotId: new ObjectId(lotId),
            lotTitle: lot.title,
            lotPhoto: lot.mainPhotoUrl,
            winnerId: user?._id,
            winnerName: user?.name,
            ownerId: lot.userId,
            ownerName: lot.userName,
            messages: [welcomeMessage],
            createdAt: new Date(),
            status: 'active',
            unreadForOwner: true,
        }

        const result = await db.collection('chats').insertOne(newChat)

        await db.collection('lots').updateOne(
            { _id: new ObjectId(lotId) },
            { $set: { status: 'reserved' } }
        )

        return NextResponse.json(
            { status: 201, chat: { ...newChat, _id: result.insertedId } },
            corsHeaders
        )
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'