import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const body = await req.formData()
        const orderReference = body.get('orderReference') as string
        const transactionStatus = body.get('transactionStatus') as string

        const merchantSecretKey = process.env.WAYFORPAY_MERCHANT_SECRET_KEY as string

        const responseSignatureString = [
            orderReference,
            'accept',
            Math.floor(Date.now() / 1000),
        ].join(';')

        const responseSignature = crypto
            .createHmac('md5', merchantSecretKey)
            .update(responseSignatureString)
            .digest('hex')

        return NextResponse.json({
            orderReference,
            status: 'accept',
            time: Math.floor(Date.now() / 1000),
            signature: responseSignature,
        })
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}