import { NextResponse } from 'next/server'
import crypto from 'crypto'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'

export async function POST(req: Request) {
    try {
        const { validatedTokenResult, reqBody, db, token } = await getAuthRouteData(
            clientPromise,
            req
        )

        if (validatedTokenResult.status !== 200) {
            return NextResponse.json(validatedTokenResult)
        }

        const { amount } = reqBody

        if (!amount || amount < 10) {
            return NextResponse.json(
                { message: 'Мінімальна сума поповнення 10 ₴' },
                { status: 400 }
            )
        }

        const user = await findUserByEmail(db, parseJwt(token as string).email)

        const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT
        const merchantSecretKey = process.env.WAYFORPAY_MERCHANT_SECRET_KEY

        if (!merchantAccount || !merchantSecretKey) {
            return NextResponse.json({ message: 'API keys are missing' }, { status: 500 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const orderReference = `topup_${user?._id}_${Date.now()}`
        const orderDate = Math.floor(Date.now() / 1000)
        const currency = 'UAH'
        const productName = ['Поповнення балансу RoyalTick']
        const productPrice = [amount]
        const productCount = [1]

        const signatureString = [
            merchantAccount,
            'www.market.ua',
            orderReference,
            orderDate,
            amount.toString(),
            currency,
            productName[0],
            productCount[0],
            productPrice[0].toString(),
        ].join(';')

        const merchantSignature = crypto
            .createHmac('md5', merchantSecretKey)
            .update(signatureString)
            .digest('hex')

        const paymentData = {
            merchantAccount,
            merchantDomainName: 'www.market.ua',
            orderReference,
            orderDate,
            amount,
            currency,
            orderTimeout: 49000,
            productName,
            productPrice,
            productCount,
            clientFirstName: user?.name || '',
            clientEmail: user?.email || '',
            returnUrl: `${baseUrl}/api/payment/topup/return`,
            serviceUrl: `${baseUrl}/api/success-callback/topup`,
            merchantSignature,
            language: 'UA',
        }

        return NextResponse.json({ result: paymentData }, { status: 200 })
    } catch (error) {
        console.error('Topup route error:', error)
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}