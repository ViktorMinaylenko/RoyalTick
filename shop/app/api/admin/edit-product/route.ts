import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import { ObjectId } from 'mongodb'

const ALLOWED_COLLECTIONS = ['watches', 'straps', 'boxes', 'care']

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const { _id, category, newImages, oldImages, ...productData } = reqBody

        if (!ALLOWED_COLLECTIONS.includes(category)) {
            return NextResponse.json({ status: 400, message: 'Unknown category' }, corsHeaders)
        }

        const processedNewImages = (newImages || []).map((img: any) => ({
            url: img.dataUrl || img.src || img.url || '',
            desc: img.title || img.desc || '',
        }))

        const allImages = [...(oldImages || []), ...processedNewImages]

        const updateData = {
            ...productData,
            category,
            images: allImages,
        }

        await db.collection(category).updateOne(
            { _id: new ObjectId(_id) },
            { $set: updateData }
        )

        const updatedItem = await db.collection(category).findOne({ _id: new ObjectId(_id) })

        return NextResponse.json({
            status: 200,
            updatedItem: { ...updatedItem, id: updatedItem?._id?.toString() },
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ status: 500, message: (error as Error).message }, corsHeaders)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}

export const dynamic = 'force-dynamic'