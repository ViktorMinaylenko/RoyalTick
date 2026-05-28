import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)

        const { _id, id, password, image, name, email, role, ...rest } = reqBody

        const userId = _id || id
        if (!userId) {
            return NextResponse.json({
                status: 400,
                message: 'User id is required',
            }, corsHeaders)
        }

        const updateData: Record<string, unknown> = {
            ...rest,
            name,
            email,
            role,
            image: {
                url: image?.src || image?.url || '',
                desc: image ? name : '',
            },
        }

        await db.collection('users').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        )

        const updatedUser = await db.collection('users').findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        )

        return NextResponse.json({
            status: 200,
            updatedUser: { ...updatedUser, id: updatedUser?._id?.toString() },
        }, corsHeaders)
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: (error as Error).message,
        }, corsHeaders)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}