import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { sendMail } from '@/service/mailService'
import { corsHeaders } from '@/constants/corsHeaders'

export async function POST(req: Request) {
    try {
        const { reqBody } = await getDbAndReqBody(clientPromise, req)

        await sendMail(
            'RoyalTick',
            reqBody.email,
            `Посилання для збросу пароля: ${process.env.NEXT_PUBLIC_BASE_URL}/password-restore`
        )

        return NextResponse.json({ status: 200 }, corsHeaders)
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}