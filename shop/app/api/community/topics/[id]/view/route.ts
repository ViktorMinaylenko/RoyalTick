import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { db } = await getDbAndReqBody(clientPromise, null)

        let userId: string | null = null
        try {
            const body = await req.json()
            userId = body.userId || null
        } catch { }

        const topic = await db.collection('topics').findOne(
            { _id: new ObjectId(id) },
            { projection: { viewedBy: 1, views: 1 } }
        )

        if (!topic) {
            return NextResponse.json({ status: 404 }, corsHeaders)
        }

        if (userId) {
            const alreadyViewed = (topic.viewedBy || []).some(
                (v: any) => String(v) === String(userId)
            )
            if (alreadyViewed) {
                return NextResponse.json({ status: 200, views: topic.views }, corsHeaders)
            }

            await db.collection('topics').updateOne(
                { _id: new ObjectId(id) },
                {
                    $inc: { views: 1 },
                    $addToSet: { viewedBy: new ObjectId(userId) } as any,
                }
            )
        } else {
            await db.collection('topics').updateOne(
                { _id: new ObjectId(id) },
                { $inc: { views: 1 } }
            )
        }

        const updated = await db.collection('topics').findOne(
            { _id: new ObjectId(id) },
            { projection: { views: 1 } }
        )

        return NextResponse.json({ status: 200, views: updated?.views ?? 0 }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'