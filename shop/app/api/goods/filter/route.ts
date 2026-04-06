import clientPromise from "@/lib/mongodb";
import { getDbAndReqBody } from "@/lib/utils/api-routes";
import { checkPriceParam, getCheckedSizesArrayParam } from "@/lib/utils/common";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)
        const limit = url.searchParams.get('limit') || 12
        const offset = url.searchParams.get('offset') || 0
        const isCatalogParam = url.searchParams.get('catalog')
        const categoryParam = url.searchParams.get('category')
        const typeParam = url.searchParams.get('type')
        const priceFromParam = url.searchParams.get('priceFrom')
        const priceToParam = url.searchParams.get('priceTo')
        const isFullyFilteredByPrice = priceFromParam && priceToParam && checkPriceParam(+priceFromParam) && checkPriceParam(+priceToParam)
        const sizesParam = url.searchParams.get('sizes')
        const sizesArray = getCheckedSizesArrayParam(sizesParam as string)
        const filter = {
            ...(typeParam && { type: typeParam }),
            ...(isFullyFilteredByPrice && { price: { $gt: +priceFromParam, $lt: +priceToParam } }),
            ...(sizesArray && {
                $and: (sizesArray as string[]).map((sizes) => ({
                    [`sizes.${sizes.toLowerCase()}`]: true,
                }))
            }),
        }

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

        const currentGoods = await db.collection(categoryParam as string).find(filter).toArray()

        return NextResponse.json({
            count: currentGoods.length,
            items: currentGoods.slice(+offset, +limit),
        })
    } catch (error) {
        throw new Error((error as Error).message);
    }
}