import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData } from '@/lib/utils/api-routes'

export async function PATCH(req: Request) {
  try {
    const { db, reqBody, validatedTokenResult } = await getAuthRouteData(
      clientPromise,
      req
    )

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id || id === 'undefined') {
      return NextResponse.json({
        status: 400,
        message: 'Invalid or missing ID',
      })
    }

    const count = reqBody.count

    await db
      .collection('cart')
      .updateOne({ _id: new ObjectId(id) }, { $set: { count } })

    return NextResponse.json({ status: 204, id, count })
  } catch (error) {
    return NextResponse.json({ status: 500, message: (error as Error).message })
  }
}
