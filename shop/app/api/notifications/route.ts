import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'

export async function GET(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const notifications = await db.collection('notifications')
            .find({ userId: user?._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .toArray()

        const unreadCount = await db.collection('notifications').countDocuments({
            userId: user?._id,
            isRead: false,
        })

        return NextResponse.json({ status: 200, notifications, unreadCount }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'