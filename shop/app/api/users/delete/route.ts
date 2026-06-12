import clientPromise from '@/lib/mongodb'
import { getAuthRouteData } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'

export async function DELETE(req: Request) {
    try {
        const { db, validatedTokenResult } = await getAuthRouteData(
            clientPromise,
            req,
            false
        )

        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const id = req.url.split('id=')[1]

        const activeLots = await db.collection('lots').countDocuments({
            userId: new ObjectId(id),
            status: { $in: ['active', 'reserved'] },
        })

        if (activeLots > 0) {
            return NextResponse.json({
                status: 403,
                message: 'Не можна видалити акаунт поки є активні лоти або лоти в резерві. Завершіть або скасуйте їх спочатку.',
            }, corsHeaders)
        }

        await db.collection('users').deleteOne({ _id: new ObjectId(id) })

        return NextResponse.json({ status: 204, id }, corsHeaders)
    } catch (error) {
        throw new Error((error as Error).message)
    }
}