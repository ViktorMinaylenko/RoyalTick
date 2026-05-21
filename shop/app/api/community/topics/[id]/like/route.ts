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

        const topic = await db.collection('topics').findOne({ _id: new ObjectId(id) })
        const isLiked = topic?.likes?.some((l: any) => String(l) === String(user?._id))

        if (isLiked) {
            await db.collection('topics').updateOne(
                { _id: new ObjectId(id) },
                { $pull: { likes: user?._id } } as any
            )
        } else {
            await db.collection('topics').updateOne(
                { _id: new ObjectId(id) },
                { $addToSet: { likes: user?._id } } as any
            )
        }

        const updated = await db.collection('topics').findOne({ _id: new ObjectId(id) })
        return NextResponse.json({
            status: 200,
            isLiked: !isLiked,
            likesCount: updated?.likes?.length ?? 0,
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'