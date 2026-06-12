import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

export async function POST(req: Request) {
    try {
        const {db, reqBody} = await getDbAndReqBody(clientPromise, req)

        const codeData = await db
            .collection('codes')
            .findOne({ _id: new ObjectId(reqBody.codeId) })

        if (!codeData) {
            return NextResponse.json({
                error: {message: 'Code not found'},
                status: 400,
            })
        }

        if (codeData.code === reqBody.code) {
            return NextResponse.json({
                result: true,
                status: 200,
                newEmail: codeData.newEmail,
            })
        }

        return NextResponse.json({
            error: {message: 'Invalid code'},
            status: 400,
        })
    } catch (error) {
        throw new Error((error as Error).message)
    }
}
