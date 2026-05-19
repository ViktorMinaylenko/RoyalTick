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
        const { db } = await getDbAndReqBody(clientPromise, null)

        const lot = await db.collection('lots').findOne(
            { _id: new ObjectId(id) },
            { projection: { comments: 1, userId: 1, bids: 1 } }
        )

        if (!lot) {
            return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        }

        return NextResponse.json({ status: 200, comments: lot.comments || [], lotOwnerId: lot.userId }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

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
            return NextResponse.json({ message: 'Порожній коментар', status: 400 }, corsHeaders)
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)
        const lot = await db.collection('lots').findOne({ _id: new ObjectId(id) })

        if (!lot) {
            return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        }

        const isOwner = String(lot.userId) === String(user?._id)
        const hasBid = lot.bids?.some((b: any) => String(b.userId) === String(user?._id))
        const role = isOwner ? 'seller' : hasBid ? 'buyer' : 'user'

        const newComment = {
            _id: new ObjectId(),
            userId: user?._id,
            userName: user?.name,
            role,
            text: text.trim(),
            createdAt: new Date(),
        }

        await db.collection('lots').updateOne(
            { _id: new ObjectId(id) },
            { $push: { comments: newComment } } as any
        )

        const updatedLot = await db.collection('lots').findOne(
            { _id: new ObjectId(id) },
            { projection: { comments: 1, userId: 1 } }
        )

        return NextResponse.json({ status: 200, comments: updatedLot?.comments || [] }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'