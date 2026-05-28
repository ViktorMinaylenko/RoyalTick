import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)

        const user = await db.collection('users').findOne({ email: reqBody.email })
        if (user) {
            return NextResponse.json({
                status: 400,
                message: 'Користувач з таким email вже існує',
            }, corsHeaders)
        }

        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(reqBody.password, salt)

        const newUser = {
            ...reqBody,
            image: {
                url: reqBody.image?.src || '',
                desc: reqBody.image ? reqBody.name : '',
            },
            password: hash,
        }

        const { insertedId } = await db.collection('users').insertOne(newUser)

        return NextResponse.json({
            status: 201,
            newUser: { _id: insertedId, ...newUser, password: undefined },
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