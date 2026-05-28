import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'

const ALLOWED_COLLECTIONS = ['watches', 'straps', 'boxes', 'care']

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const { category, images, ...productData } = reqBody

        if (!ALLOWED_COLLECTIONS.includes(category)) {
            return NextResponse.json({ status: 400, message: 'Unknown category' }, corsHeaders)
        }

        const processedImages = (images || []).map((img: any) => ({
            url: img.dataUrl || img.src || img.url || '',
            desc: img.title || img.desc || '',
        }))

        const newItem = {
            ...productData,
            category,
            images: processedImages,
        }

        const { insertedId } = await db.collection(category).insertOne(newItem)

        return NextResponse.json({
            status: 201,
            newItem: { ...newItem, _id: insertedId },
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ status: 500, message: (error as Error).message }, corsHeaders)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}

export const dynamic = 'force-dynamic'