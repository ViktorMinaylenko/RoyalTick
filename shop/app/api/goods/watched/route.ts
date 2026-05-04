import { logger } from '@/lib/logger'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const productsPayload: { _id: string; category: string }[] = reqBody.payload

        if (!productsPayload) {
            return NextResponse.json({
                message: 'payload is required',
                status: 404,
            })
        }

        const getWatchedProductsByCategory = async (category: string) => {
            const goods = await db.collection(category).find({ _id: { $in: productsPayload.map(({ _id }) => new ObjectId(_id)) } }).toArray()

            return goods
        }

        const [watches, straps, boxes, care] = await Promise.allSettled([
            getWatchedProductsByCategory('watches'),
            getWatchedProductsByCategory('straps'),
            getWatchedProductsByCategory('boxes'),
            getWatchedProductsByCategory('care'),
        ])

        if (
            watches.status !== 'fulfilled' ||
            straps.status !== 'fulfilled' ||
            boxes.status !== 'fulfilled' ||
            care.status !== 'fulfilled'
        ) {
            logger.warn('Some collections failed to load in catalog');
            return NextResponse.json({ count: 0, items: [] })
        }
        const allGoods = [
            ...watches.value,
            ...straps.value,
            ...boxes.value,
            ...care.value,
        ]

        logger.info({ totalCount: allGoods.length }, 'Catalog request successful');
        return NextResponse.json({
            count: allGoods.length,
            items: allGoods,
        })

    } catch (error) {
        throw new Error((error as Error).message)
    }
}