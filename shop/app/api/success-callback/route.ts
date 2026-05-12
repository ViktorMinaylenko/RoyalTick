import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const body = await req.formData()
        const orderReference = body.get('orderReference') as string
        const transactionStatus = body.get('transactionStatus') as string

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        return NextResponse.redirect(
            `${baseUrl}/payment-success?orderReference=${orderReference}&status=${transactionStatus}`,
            { status: 302 }
        )
    } catch (error) {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.redirect(
            `${baseUrl}/payment-success?status=error`,
            { status: 302 }
        )
    }
}