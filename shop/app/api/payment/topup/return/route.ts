import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
    try {
        const body = await req.formData()
        const transactionStatus = body.get('transactionStatus') as string
        const orderReference = body.get('orderReference') as string
        const amount = body.get('amount') as string
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        console.log('TOPUP RETURN:', { transactionStatus, orderReference, amount }) // 👈

        if (transactionStatus === 'Approved' && orderReference?.startsWith('topup_')) {
            const userId = orderReference.split('_')[1]
            console.log('Updating userId:', userId, 'amount:', amount) // 👈

            const { db } = await getDbAndReqBody(clientPromise, null)
            const result = await db.collection('users').updateOne(
                { _id: new ObjectId(userId) },
                { $inc: { balance: Number(amount) } }
            )
            console.log('Update result:', result) // 👈
        }

        return NextResponse.redirect(
            `${baseUrl}/profile?topup=${transactionStatus}`,
            { status: 302 }
        )
    } catch (error) {
        console.error('TOPUP RETURN ERROR:', error) // 👈
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.redirect(`${baseUrl}/profile`, { status: 302 })
    }
}