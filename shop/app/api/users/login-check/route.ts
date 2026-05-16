import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import {
  getAuthRouteData,
  findUserByEmail,
  parseJwt,
} from '@/lib/utils/api-routes'
import { IUser } from '@/types/user'

export async function GET(req: Request) {
  try {
    const { db, validatedTokenResult, token } = await getAuthRouteData(
      clientPromise,
      req,
      false
    )

    if (validatedTokenResult.status !== 200) {
      return NextResponse.json(validatedTokenResult)
    }

    const userData = parseJwt(token as string)
    const user = (await findUserByEmail(db, userData.email)) as unknown as IUser

    if (!user) {
      return NextResponse.json({
        status: 404,
        message: 'User not found',
      })
    }

    return NextResponse.json({
      status: 200,
      _id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      balance: user.balance ?? 0,
      rating: user.rating ?? 0,
    })
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: (error as Error).message,
    })
  }
}

export const dynamic = 'force-dynamic'
