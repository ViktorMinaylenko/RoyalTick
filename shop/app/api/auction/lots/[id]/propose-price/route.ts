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
        const { amount, comment } = body

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json({ message: 'Введіть коректну суму', status: 400 }, corsHeaders)
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)
        const lot = await db.collection('lots').findOne({ _id: new ObjectId(id) })

        if (!lot) return NextResponse.json({ message: 'Лот не знайдено', status: 404 }, corsHeaders)
        if (lot.saleType !== 'fixed_price') return NextResponse.json({ message: 'Лот не є фіксованою ціною', status: 400 }, corsHeaders)
        if (String(lot.userId) === String(user?._id)) return NextResponse.json({ message: 'Не можна пропонувати ціну на власний лот', status: 403 }, corsHeaders)
        if (user?.isBlocked) return NextResponse.json({ message: 'Акаунт заблоковано', status: 403 }, corsHeaders)

        const proposal = {
            userId: user?._id,
            userName: user?.name,
            amount: Number(amount),
            comment: comment || '',
            status: 'pending',
            createdAt: new Date(),
        }

        await db.collection('lots').updateOne(
            { _id: new ObjectId(id) },
            { $set: { priceProposal: proposal } }
        )

        await db.collection('notifications').insertOne({
            userId: lot.userId,
            type: 'price_proposed',
            actorName: user?.name,
            lotTitle: lot.title,
            lotId: lot._id,
            bidAmount: Number(amount),
            comment: comment || '',
            isRead: false,
            href: `/auction/${id}`,
            createdAt: new Date(),
        })

        return NextResponse.json({ status: 200, proposal }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'