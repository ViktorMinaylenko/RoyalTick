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
        const currentUser = await findUserByEmail(db, parseJwt(token as string).email)

        if (String(currentUser?._id) === id) {
            return NextResponse.json({ message: 'Не можна підписатись на себе', status: 400 }, corsHeaders)
        }

        const targetUser = await db.collection('users').findOne({ _id: new ObjectId(id) })
        if (!targetUser) {
            return NextResponse.json({ message: 'Користувача не знайдено', status: 404 }, corsHeaders)
        }

        const isFollowing = (targetUser.followers ?? []).some(
            (f: any) => String(f) === String(currentUser?._id)
        )

        if (isFollowing) {
            await db.collection('users').updateOne(
                { _id: new ObjectId(id) },
                { $pull: { followers: currentUser?._id } } as any
            )
            await db.collection('users').updateOne(
                { _id: currentUser?._id },
                { $pull: { following: new ObjectId(id) } } as any
            )
        } else {
            await db.collection('users').updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { followers: currentUser?._id } } as any
            )
            await db.collection('users').updateOne(
                { _id: currentUser?._id },
                { $addToSet: { following: new ObjectId(id) } } as any
            )
        }

        const updated = await db.collection('users').findOne({ _id: new ObjectId(id) })

        return NextResponse.json({
            status: 200,
            isFollowing: !isFollowing,
            followersCount: (updated?.followers ?? []).length,
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'