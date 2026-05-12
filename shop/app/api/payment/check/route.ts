import axios from 'axios'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(req: Request) {
    try {
        const reqBody = await req.json()

        const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT
        const merchantSecretKey = process.env.WAYFORPAY_MERCHANT_SECRET_KEY

        if (!merchantAccount || !merchantSecretKey) {
            return NextResponse.json({ message: 'API keys are missing' }, { status: 500 })
        }

        // Create signature for WayForPay API request
        const signatureString = [
            merchantAccount,
            reqBody.orderReference,
        ].join(';')

        const merchantSignature = crypto
            .createHmac('md5', merchantSecretKey)
            .update(signatureString)
            .digest('hex')

        // Get payment info from WayForPay
        const { data } = await axios({
            method: 'post',
            url: 'https://api.wayforpay.com/api/merchant/transactions',
            data: {
                merchantAccount,
                orderReference: reqBody.orderReference,
                merchantSignature,
            },
        })

        return NextResponse.json({ result: data }, { status: 200 })
    } catch (error) {
        console.error('Payment check error:', error)
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}