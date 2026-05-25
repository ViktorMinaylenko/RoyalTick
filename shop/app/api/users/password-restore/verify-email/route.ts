import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { findUserByEmail, getDbAndReqBody } from '@/lib/utils/api-routes'
import { sendMail } from '@/service/mailService'

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
        const user = await findUserByEmail(db, reqBody.email)

        if (!user) {
            return NextResponse.json({
                error: { message: 'Користувача з таким email не знайдено!' },
                status: 400,
            })
        }

        const code = Math.floor(100000 + Math.random() * 900000)

        await sendMail(
            'RoyalTick',
            reqBody.email,
            `Ваш код підтвердження для відновлення паролю: ${code}`
        )

        const { insertedId } = await db.collection('codes').insertOne({
            code,
        })

        return NextResponse.json({ status: 200, codeId: insertedId })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}