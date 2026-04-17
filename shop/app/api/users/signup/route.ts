import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { logger } from '@/lib/logger'
import {
  createUserAndGenerateTokens,
  findUserByEmail,
  getDbAndReqBody,
} from '@/lib/utils/api-routes'

export async function POST(req: Request) {
  try {
    const { db, reqBody } = await getDbAndReqBody(clientPromise, req)

    logger.info({ email: reqBody.email }, 'New user registration attempt')

    const user = await findUserByEmail(db, reqBody.email)

    if (user) {
      logger.warn({ email: reqBody.email }, 'Registration failed: user already exists')
      return NextResponse.json({
        warningMessage: 'Користувач вже існує',
      })
    }

    const tokens = await createUserAndGenerateTokens(db, reqBody)

    logger.info({ email: reqBody.email }, 'User registered successfully')
    return NextResponse.json(tokens)
  } catch (error) {
    logger.error(error, 'User registration error')
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}