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
        const { reason } = reqBody
        const moderator = await findUserByEmail(db, parseJwt(token as string).email)

        if (moderator?.role !== 'moderator' && moderator?.role !== 'admin') {
            return NextResponse.json({ message: 'Доступ заборонено', status: 403 }, corsHeaders)
        }

        const target = await db.collection('users').findOne({ _id: new ObjectId(id) })
        if (!target) {
            return NextResponse.json({ message: 'Користувача не знайдено', status: 404 }, corsHeaders)
        }

        const newBlockedState = !target.isBlocked

        await db.collection('users').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    isBlocked: newBlockedState,
                    blockReason: newBlockedState
                        ? (reason?.trim() || 'Порушення правил платформи')
                        : null,
                    blockedAt: newBlockedState ? new Date() : null,
                    blockedBy: newBlockedState ? moderator?.name : null,
                }
            }
        )

        return NextResponse.json({
            status: 200,
            isBlocked: newBlockedState,
            blockReason: newBlockedState ? (reason?.trim() || 'Порушення правил платформи') : null,
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'