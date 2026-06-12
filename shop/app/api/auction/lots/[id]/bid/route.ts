import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'
import { createNotification } from '@/lib/utils/createNotification'

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
        const { bidAmount } = reqBody

        const lot = await db.collection('lots').findOne({ _id: new ObjectId(id) })

        if (!lot) {
            return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        }

        if (lot.status !== 'active') {
            return NextResponse.json({ message: 'Аукціон завершено', status: 400 }, corsHeaders)
        }

        if (new Date() > new Date(lot.endDate)) {
            return NextResponse.json({ message: 'Час аукціону вийшов', status: 400 }, corsHeaders)
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)

        if (user?.isBlocked) {
            return NextResponse.json({
                message: 'Ваш акаунт заблоковано. Ви не можете робити ставки.',
                status: 403,
            }, corsHeaders)
        }

        if (String(lot.userId) === String(user?._id)) {
            return NextResponse.json({ message: 'Не можна ставити ставку на власний лот', status: 403 }, corsHeaders)
        }

        const minBid = lot.currentPrice + lot.bidStep
        if (bidAmount < minBid) {
            return NextResponse.json(
                { message: `Мінімальна ставка: ${minBid} ₴`, status: 400 },
                corsHeaders
            )
        }

        if (bidAmount > 1000000) {
            return NextResponse.json(
                { message: 'Максимальна ставка не може перевищувати 1 000 000 ₴', status: 400 },
                corsHeaders
            )
        }

        const newBid = {
            userId: user?._id,
            userName: user?.name,
            amount: bidAmount,
            createdAt: new Date(),
        }

        await db.collection('lots').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: { currentPrice: bidAmount },
                $push: { bids: newBid } as any,
            }
        )

        await createNotification({
            db,
            userId: lot.userId,
            type: 'bid_on_lot',
            actorName: user?.name,
            lotTitle: lot.title,
            bidAmount,
            href: `/auction/${id}`,
        })

        const previousTopBid = lot.bids[lot.bids.length - 1]
        if (
            previousTopBid &&
            String(previousTopBid.userId) !== String(user?._id) &&
            String(previousTopBid.userId) !== String(lot.userId)
        ) {
            await createNotification({
                db,
                userId: previousTopBid.userId,
                type: 'bid_outbid',
                actorName: user?.name,
                lotTitle: lot.title,
                bidAmount,
                href: `/auction/${id}`,
            })
        }

        const updatedLot = await db.collection('lots').findOne({ _id: new ObjectId(id) })

        return NextResponse.json({ status: 200, lot: updatedLot }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'