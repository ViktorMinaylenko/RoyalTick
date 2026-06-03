import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { db } = await getDbAndReqBody(clientPromise, null)

        const user = await db.collection('users').findOne(
            { _id: new ObjectId(id) },
            {
                projection: {
                    name: 1, image: 1, sellerRating: 1, sellerRatingsCount: 1,
                    buyerRating: 1, buyerRatingsCount: 1,
                    followers: 1, following: 1,
                    sellerReviews: 1, createdAt: 1,
                    isBlocked: 1,
                    blockReason: 1,
                    blockedAt: 1,
                    isVerified: 1,
                    verifiedAt: 1,
                }
            }
        )

        if (!user) {
            return NextResponse.json({ message: 'Користувача не знайдено', status: 404 }, corsHeaders)
        }

        const activeLots = await db.collection('lots').find({
            userId: new ObjectId(id),
            status: 'active',
        }).sort({ createdAt: -1 }).limit(20).toArray()

        return NextResponse.json({
            status: 200,
            user: {
                _id: user._id,
                name: user.name,
                image: user.image,
                sellerRating: user.sellerRating ?? 0,
                sellerRatingsCount: user.sellerRatingsCount ?? 0,
                buyerRating: user.buyerRating ?? 0,
                buyerRatingsCount: user.buyerRatingsCount ?? 0,
                followersCount: (user.followers ?? []).length,
                followingCount: (user.following ?? []).length,
                followers: user.followers ?? [],
                sellerReviews: user.sellerReviews ?? [],
                isBlocked: user.isBlocked ?? false,
                blockReason: user.blockReason ?? null,
                isVerified: user.isVerified ?? false,
                verifiedAt: user.verifiedAt ?? null,
            },
            activeLots,
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'