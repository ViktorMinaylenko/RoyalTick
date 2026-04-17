import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { logger } from '@/lib/logger'
import {
  findUserByEmail,
  generateTokens,
  getDbAndReqBody,
} from '@/lib/utils/api-routes'

export async function POST(req: Request) {
  try {
    const { db, reqBody } = await getDbAndReqBody(clientPromise, req)

    logger.info({ email: reqBody.email }, 'User login attempt')

    const user = await findUserByEmail(db, reqBody.email)

    if (!user) {
      logger.warn({ email: reqBody.email }, 'Login failed: user does not exist')
      return NextResponse.json({
        warningMessage: 'Користувача не існує',
      })
    }

    if (!bcrypt.compareSync(reqBody.password, user.password)) {
      logger.warn({ email: reqBody.email }, 'Login failed: invalid password')
      return NextResponse.json({
        warningMessage: 'Невірний логін або пароль!',
      })
    }

    const tokens = generateTokens(user.name, reqBody.email)

    logger.info({ email: reqBody.email }, 'User logged in successfully')
    return NextResponse.json(tokens)

  } catch (error) {
    logger.error(error, 'Unexpected error during login')
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 })
  }
}