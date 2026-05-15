import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData, parseJwt } from '@/lib/utils/api-routes'
import { sendMail } from '@/service/mailService'

export async function POST(req: Request) {
    try {
        const { db, validatedTokenResult, reqBody, token } = await getAuthRouteData(
            clientPromise,
            req
        )

        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult)
        }

        if (!reqBody.email) {
            return NextResponse.json({
                message: 'Email field is required',
                status: 400,
            })
        }

        const user = await db
            .collection('users')
            .findOne({ email: reqBody.email })

        if (user){
            return NextResponse.json({
                message: 'User with this email already exists',
                status: 400,
            })
        }

        const code = Math.floor(100000 + Math.random() * 900000)

        await sendMail(
            'RoyalTick',
            reqBody.email,
            `Ваш код для підтвердження зміни email: ${code}`
        )

        const {insertedId} = await db.collection('codes').insertOne({
            code: code,
            oldEmail: parseJwt(token as string).email,
            newEmail: reqBody.email,
        })


        return NextResponse.json({
            status: 200,
            codeId: insertedId,
        })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}
