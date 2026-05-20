import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

const verifySignature = (params: string[], secretKey: string, signature: string) => {
    const str = params.join(';')
    const expected = crypto.createHmac('md5', secretKey).update(str).digest('hex')
    return expected === signature
}

export async function POST(req: Request) {
    try {
        const secretKey = process.env.WAYFORPAY_MERCHANT_SECRET_KEY as string

        const body = await req.formData()
        const merchantAccount = body.get('merchantAccount') as string
        const orderReference = body.get('orderReference') as string
        const amount = body.get('amount') as string
        const currency = body.get('currency') as string
        const authCode = body.get('authCode') as string
        const cardPan = body.get('cardPan') as string
        const transactionStatus = body.get('transactionStatus') as string
        const reasonCode = body.get('reasonCode') as string
        const merchantSignature = body.get('merchantSignature') as string

        const signatureParams = [
            merchantAccount,
            orderReference,
            amount,
            currency,
            authCode,
            cardPan,
            transactionStatus,
            String(reasonCode),
        ]

        const isValid = verifySignature(signatureParams, secretKey, merchantSignature)

        if (!isValid) {
            return NextResponse.json({ status: 'error', message: 'Invalid signature' })
        }

        if (transactionStatus === 'Approved') {
            const userId = orderReference.split('_')[1]
            const { db } = await getDbAndReqBody(clientPromise, null)

            await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { balance: Number(amount) } }
            )
        }

        const responseTime = Math.floor(Date.now() / 1000)
        const responseSignature = crypto
            .createHmac('md5', secretKey)
            .update(`${orderReference};accept;${responseTime}`)
            .digest('hex')

        return NextResponse.json({
            orderReference,
            status: 'accept',
            time: responseTime,
            signature: responseSignature,
        })
    } catch (error) {
        return NextResponse.json({ status: 'error', message: (error as Error).message })
    }
}

export const dynamic = 'force-dynamic'