import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import {
    getDbAndReqBody,
    isValidAccessToken,
    parseJwt,
    findUserByEmail,
} from '@/lib/utils/api-routes'
import { v2 as cloudinary } from 'cloudinary'
import { ObjectId } from 'mongodb'

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
        const limit = Number(url.searchParams.get('limit')) || 12
        const userId = url.searchParams.get('userId')

        const filter: any = { status: 'active' }
        if (userId) {
            try {
                filter.userId = new ObjectId(userId)
            } catch {
                filter.userId = userId
            }
        }

        const [lots, count] = await Promise.all([
            db.collection('lots')
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(offset)
                .limit(limit)
                .toArray(),
            db.collection('lots').countDocuments(filter),
        ])

        return NextResponse.json({ status: 200, lots, count }, corsHeaders)
    } catch (error) {
        return NextResponse.json(
            { message: (error as Error).message, status: 500 },
            corsHeaders
        )
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
        const description = formData.get('description') as string
        const startPrice = formData.get('startPrice') as string
        const endDate = formData.get('endDate') as string

        if (!title || !description || !startPrice || !endDate) {
            return NextResponse.json(
                { message: 'Всі обовʼязкові поля мають бути заповнені', status: 400 },
                corsHeaders
            )
        }

        const mainPhotoFile = formData.get('mainPhoto') as File | null
        let mainPhotoUrl = ''
        if (mainPhotoFile && mainPhotoFile.size > 0) {
            mainPhotoUrl = await uploadToCloudinary(mainPhotoFile, 'royaltick/auction')
        }

        const additionalPhotoUrls: string[] = []
        for (let i = 0; i < 4; i++) {
            const file = formData.get(`additionalPhoto_${i}`) as File | null
            if (file && file.size > 0) {
                const url = await uploadToCloudinary(file, 'royaltick/auction')
                additionalPhotoUrls.push(url)
            }
        }

        const { db } = await getDbAndReqBody(clientPromise, null)
        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const newLot = {
            title,
            category: formData.get('category') as string,
            subcategory: formData.get('subcategory') as string,
            description,
            condition: formData.get('condition') as string,
            saleType: formData.get('saleType') as string,
            startPrice: Number(startPrice),
            currentPrice: Number(startPrice),
            bidStep: Number(formData.get('bidStep')),
            reservePrice: Number(formData.get('reservePrice')) || null,
            buyNowPrice: Number(formData.get('buyNowPrice')) || null,
            startDate: formData.get('startDate') ? new Date(formData.get('startDate') as string) : null,
            endDate: new Date(endDate),
            autoExtend: formData.get('autoExtend') === 'true',
            location: formData.get('location') as string,
            deliveryMethods: formData.getAll('deliveryMethods') as string[],
            deliveryPayer: formData.get('deliveryPayer') as string,
            returnsAllowed: formData.get('returnsAllowed') === 'true',
            guarantees: formData.get('guarantees') as string,
            buyerComment: formData.get('buyerComment') as string,
            moderatorNote: formData.get('moderatorNote') as string,
            videoUrl: formData.get('videoUrl') as string,
            mainPhotoUrl,
            additionalPhotoUrls,
            userId: user?._id,
            userName: user?.name,
            userEmail: user?.email,
            createdAt: new Date(),
            status: 'active',
            bids: [],
        }

        const result = await db.collection('lots').insertOne(newLot)

        return NextResponse.json(
            { status: 201, lot: { ...newLot, _id: result.insertedId } },
            corsHeaders
        )
    } catch (error) {
        console.error('Auction POST error:', error)
        return NextResponse.json(
            { message: (error as Error).message, status: 500 },
            corsHeaders
        )
    }
}

export const dynamic = 'force-dynamic'