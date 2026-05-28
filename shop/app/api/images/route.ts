import clientPromise from "@/lib/mongodb"
import { getDbAndReqBody } from "@/lib/utils/api-routes"
import { NextResponse } from "next/server"
import { corsHeaders } from "@/constants/corsHeaders"

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)
        const imgId = url.searchParams.get('id')

        if (!imgId) {
            return NextResponse.json({ status: 400, message: 'id is required' }, corsHeaders)
        }

        const image = await db.collection('images').findOne({ imgId })

        if (!image) {
            return NextResponse.json({ status: 404, message: 'Image not found' }, corsHeaders)
        }

        const rawData = image.dataUrl || image.src

        if (!rawData) {
            return NextResponse.json({ status: 404, message: 'Image data not found' }, corsHeaders)
        }

        const base64Data = rawData.replace(/^data:image\/\w+;base64,/, '')
        const imageBuffer = Buffer.from(base64Data, 'base64')
        const ext = (image.title || 'image.jpg').split('.').pop() || 'jpeg'

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': `image/${ext}`,
                'Access-Control-Allow-Origin': '*',
            },
        })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}