import clientPromise from "@/lib/mongodb";
import { Sort } from 'mongodb'
import { getDbAndReqBody } from "@/lib/utils/api-routes";
import { checkPriceParam, getCheckedArrayParam } from "@/lib/utils/common";
import { NextResponse } from "next/server";
import { MyColors, strapSizes, watchSizes } from "@/constants/product";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)

        logger.info({
            category: url.searchParams.get('category'),
            sort: url.searchParams.get('sort'),
            priceFrom: url.searchParams.get('priceFrom'),
            priceTo: url.searchParams.get('priceTo')
        }, 'Fetching filtered goods');

        const limit = url.searchParams.get('limit') || 12
        const offset = url.searchParams.get('offset') || 0
        const isCatalogParam = url.searchParams.get('catalog')
        const categoryParam = url.searchParams.get('category')
        const typeParam = url.searchParams.get('type')
        const priceFromParam = url.searchParams.get('priceFrom')
        const priceToParam = url.searchParams.get('priceTo')
        const isFullyFilteredByPrice = priceFromParam && priceToParam && checkPriceParam(+priceFromParam) && checkPriceParam(+priceToParam)
        const sizesParam = url.searchParams.get('sizes')
        const sizesArray = getCheckedArrayParam(sizesParam as string)
        const colorsParam = url.searchParams.get('colors')
        const colorsArray = getCheckedArrayParam(colorsParam as string)
        const sortParam = url.searchParams.get('sort') || 'default'

        const isValidColors = colorsArray && colorsArray.every((color) => MyColors.includes(color))
        const isValidSizes = sizesArray && sizesArray.every((size) =>
            watchSizes.some((s) => s.size.toString().toLowerCase() === size.toLowerCase()) ||
            strapSizes.some((s) => s.size.toString().toLowerCase() === size.toLowerCase())
        )
        const isWatches = categoryParam === 'watches'

        const filter = {
            ...(typeParam && { type: typeParam }),
            ...(isFullyFilteredByPrice && { price: { $gt: +priceFromParam, $lt: +priceToParam } }),
            ...(isValidSizes && {
                $and: (sizesArray as string[]).map((sizes) => ({
                    [`sizes.${sizes.toLowerCase()}`]: true,
                }))
            }),
            ...(isValidColors && {
                $or: (colorsArray as string[]).map((color) => ({
                    [`characteristics.${isWatches ? 'dialColor' : 'color'}`]: color.toLowerCase(),
                }))
            })
        }

        const sort = {
            ...(sortParam.includes('cheap_first') && { price: 1 }),
            ...(sortParam.includes('expensive_first') && { price: -1 }),
            ...(sortParam.includes('new') && { isNew: -1 }),
            ...(sortParam.includes('popular') && { popularity: -1 }),
        }

        if (isCatalogParam) {
            const getFilteredCollection = async (collection: string) => {
                return await db.collection(collection).find(filter).sort(sort as Sort).toArray()
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
                items: allGoods.slice(+offset, +limit),
            })
        }

        const currentGoods = await db.collection(categoryParam as string).find(filter).sort(sort as Sort).toArray()

        logger.info({ category: categoryParam, count: currentGoods.length }, 'Category fetch successful');
        return NextResponse.json({
            count: currentGoods.length,
            items: currentGoods.slice(+offset, +limit),
        })
    } catch (error) {
        logger.error(error, 'Error in filter API');
        return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
}

export const dynamic = 'force-dynamic'