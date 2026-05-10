import { NextResponse } from 'next/server'
import crypto from 'crypto'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData } from '@/lib/utils/api-routes'

export async function POST(req: Request) {
    try {
        const { validatedTokenResult, reqBody } = await getAuthRouteData(
            clientPromise,
            req
        )

        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult)
        }

        const publicKey = process.env.NEXT_PUBLIC_LIQPAY_PUBLIC_KEY
        const privateKey = process.env.LIQPAY_PRIVATE_KEY

        if (!publicKey || !privateKey) {
            return NextResponse.json({ message: 'API keys are missing' }, { status: 500 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const isSandbox = process.env.NEXT_PUBLIC_LIQPAY_SANDBOX === 'true'

        const paymentParams = {
            public_key: publicKey,
            version: 3,
            action: 'pay',
            amount: reqBody.amount,
            currency: 'UAH',
            description: reqBody.description || 'Оплата замовлення в RoyalTick',
            order_id: `order_${Date.now()}`,
            result_url: `${baseUrl}/payment-success`,
            server_url: `${baseUrl}/api/payment/callback`,
            sandbox: isSandbox ? 1 : 0,
        }

        const data = Buffer.from(JSON.stringify(paymentParams)).toString('base64')

        const signature = crypto
            .createHash('sha1')
            .update(privateKey + data + privateKey)
            .digest('base64')

        const confirmationUrl = `https://www.liqpay.ua/api/3/checkout?data=${encodeURIComponent(data)}&signature=${encodeURIComponent(signature)}`

        console.log('Payment params:', { order_id: paymentParams.order_id, amount: paymentParams.amount, isSandbox })
        console.log('Confirmation URL:', confirmationUrl)

        return NextResponse.json({
            result: {
                data,
                signature,
                confirmationUrl,
            }
        }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}