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

        const topic = await db.collection('topics').findOne({ _id: new ObjectId(id) })

        if (!topic) {
            return NextResponse.json({ message: 'Тему не знайдено', status: 404 }, corsHeaders)
        }

        return NextResponse.json({ status: 200, topic }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'