import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadToCloudinary = async (file: File, folder: string): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error || !result) return reject(error)
                resolve(result.secure_url)
            }
        ).end(buffer)
    })
}

export async function GET(req: Request) {
    try {
        const { db } = await getDbAndReqBody(clientPromise, null)
        const url = new URL(req.url)
        const offset = Number(url.searchParams.get('offset')) || 0
        const limit = Number(url.searchParams.get('limit')) || 20
        const category = url.searchParams.get('category')

        const filter: any = {}
        if (category) filter.category = category

        const [topics, count] = await Promise.all([
            db.collection('topics').aggregate([
                { $match: filter },
                { $addFields: { messagesCount: { $size: '$messages' } } },
                { $project: { messages: 0, viewedBy: 0 } },
                { $sort: { createdAt: -1 } },
                { $skip: offset },
                { $limit: limit },
            ]).toArray(),
            db.collection('topics').countDocuments(filter),
        ])

        return NextResponse.json({ status: 200, topics, count }, corsHeaders)
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export async function POST(req: Request) {
    try {
        const token = req.headers.get('authorization')?.split(' ')[1]
        const validatedTokenResult = await isValidAccessToken(token)
        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult, corsHeaders)
        }

        const formData = await req.formData()
        const title = formData.get('title') as string
        const body = formData.get('body') as string
        const category = formData.get('category') as string
        const tags = JSON.parse(formData.get('tags') as string || '[]')

        if (!title?.trim() || !body?.trim() || !category) {
            return NextResponse.json({ message: 'Заповніть всі обовязкові поля', status: 400 }, corsHeaders)
        }

        const photoUrls: string[] = []
        for (let i = 0; i < 4; i++) {
            const file = formData.get(`photo_${i}`) as File | null
            if (file && file.size > 0) {
                const url = await uploadToCloudinary(file, 'royaltick/community')
                photoUrls.push(url)
            }
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const newTopic = {
            title: title.trim(),
            body: body.trim(),
            category,
            tags,
            photoUrls,
            userId: user?._id,
            userName: user?.name,
            userImage: user?.image || '',
            createdAt: new Date(),
            views: 0,
            viewedBy: [],
            likes: [],
            messages: [],
        }

        const result = await db.collection('topics').insertOne(newTopic)
        return NextResponse.json(
            { status: 201, topic: { ...newTopic, _id: result.insertedId } },
            corsHeaders
        )
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
    }
}

export const dynamic = 'force-dynamic'