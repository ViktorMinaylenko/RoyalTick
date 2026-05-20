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
        const { reason, ratingType, percent } = reqBody
        const moderator = await findUserByEmail(db, parseJwt(token as string).email)

        if (moderator?.role !== 'moderator' && moderator?.role !== 'admin') {
            return NextResponse.json({ message: 'Доступ заборонено', status: 403 }, corsHeaders)
        }

        const target = await db.collection('users').findOne({ _id: new ObjectId(id) })
        if (!target) {
            return NextResponse.json({ message: 'Користувача не знайдено', status: 404 }, corsHeaders)
        }

        const ratingField = ratingType === 'seller' ? 'sellerRating' : 'buyerRating'
        const countField = ratingType === 'seller' ? 'sellerRatingsCount' : 'buyerRatingsCount'
        const reviewsField = ratingType === 'seller' ? 'sellerReviews' : 'buyerReviews'

        const currentRating = target[ratingField] ?? 0

        const reductionPercent = Math.min(Math.max(Number(percent) || 20, 10), 50)
        const newRating = Math.max(0, currentRating * (1 - reductionPercent / 100))

        const moderatorReview = {
            fromUserId: moderator?._id,
            fromUserName: `🛡️ Модератор ${moderator?.name}`,
            rating: 1,
            comment: `Рейтинг знижено на ${reductionPercent}%. ${reason || 'Порушення правил платформи.'}`,
            lotTitle: '—',
            createdAt: new Date(),
            isModerator: true,
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    [ratingField]: +newRating.toFixed(2),
                },
                $push: { [reviewsField]: moderatorReview } as any,
            }
        )

        return NextResponse.json({
            status: 200,
            newRating: +newRating.toFixed(2),
            reductionPercent,
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'