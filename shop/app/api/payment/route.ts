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

        const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT
        const merchantSecretKey = process.env.WAYFORPAY_MERCHANT_SECRET_KEY

        if (!merchantAccount || !merchantSecretKey) {
            return NextResponse.json({ message: 'API keys are missing' }, { status: 500 })
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const orderReference = `order_${Date.now()}`
        const orderDate = Math.floor(Date.now() / 1000)
        const amount = reqBody.amount
        const currency = 'UAH'
        const productName = ['Замовлення RoyalTick']
        const productPrice = [amount]
        const productCount = [1]

        const amountString = amount.toString();

        const signatureString = [
            merchantAccount,
            'www.market.ua',
            orderReference,
            orderDate,
            amountString,
            currency,
            productName[0],
            productCount[0],
            productPrice[0].toString()
        ].join(';');

        const merchantSignature = crypto
            .createHmac('md5', merchantSecretKey)
            .update(signatureString)
            .digest('hex');

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
            clientFirstName: reqBody.orderDetails?.name_label || '',
            clientLastName: reqBody.orderDetails?.surname_label || '',
            clientEmail: reqBody.orderDetails?.email_label || '',
            clientPhone: reqBody.orderDetails?.phone_label || '',
            returnUrl: `${baseUrl}/api/success-callback`,
            serviceUrl: `${baseUrl}/api/success-callback`,
            merchantSignature,
            language: 'UA',
        }

        return NextResponse.json({ result: paymentData }, { status: 200 })
    } catch (error) {
        console.error('Payment route error:', error)
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}