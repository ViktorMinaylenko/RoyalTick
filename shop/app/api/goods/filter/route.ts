import clientPromise from "@/lib/mongodb";
import { getDbAndReqBody } from "@/lib/utils/api-routes";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)
        const limit = url.searchParams.get('limit') || 12
        const offset = url.searchParams.get('offset') || 0
        const isCatalogParam = url.searchParams.get('catalog')
        const filter = {}

        if (isCatalogParam) {
            const getFilteredCollection = async (collection: string) => {
                const goods = await db.collection(collection).find(filter).toArray()

                return goods
            }

            const [watches, straps, boxes, care] = await Promise.allSettled([
                getFilteredCollection('watches'),
                getFilteredCollection('straps'),
                getFilteredCollection('boxes'),
                getFilteredCollection('care'),
            ])

            if (
                watches.status !== 'fulfilled' ||
                straps.status !== 'fulfilled' ||
                boxes.status !== 'fulfilled' ||
                care.status !== 'fulfilled'
            ) {
                return NextResponse.json({
                    count: 0,
                    items: [],
                }
                )
            }

            const allGoods = [
                ...watches.value,
                ...straps.value,
                ...boxes.value,
                ...care.value,
            ]

            return NextResponse.json({
                count: allGoods.length,
                items: allGoods.slice(+offset, +limit),
            })
        }

        return NextResponse.json({
            count: 0,
            items: [],
        })
    } catch (error) {
        throw new Error((error as Error).message);
    }
}