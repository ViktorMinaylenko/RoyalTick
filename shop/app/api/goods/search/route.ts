import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)
        const query = url.searchParams.get('query')

        if (!query || query.trim().length < 2) {
            return NextResponse.json({ items: [] })
        }

        const regex = new RegExp(query.trim(), 'i')

        const filter = {
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { vendorCode: { $regex: regex } },
                { category: { $regex: regex } },
                { type: { $regex: regex } },
                { collection: { $regex: regex } },
            ],
        }

        const options = { limit: 8 }

        const [watches, straps, boxes, care] = await Promise.all([
            db.collection('watches').find(filter, options).toArray(),
            db.collection('straps').find(filter, options).toArray(),
            db.collection('boxes').find(filter, options).toArray(),
            db.collection('care').find(filter, options).toArray(),
        ])

        const items = [
            ...watches.map(i => ({ ...i, category: 'watches' })),
            ...straps.map(i => ({ ...i, category: 'straps' })),
            ...boxes.map(i => ({ ...i, category: 'boxes' })),
            ...care.map(i => ({ ...i, category: 'care' })),
        ].slice(0, 12)

        return NextResponse.json({ items })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export const dynamic = 'force-dynamic'