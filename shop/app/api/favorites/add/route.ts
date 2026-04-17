import clientPromise from '@/lib/mongodb'
import { getAuthRouteData, parseJwt } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function POST(req: Request) {
  try {
    const { db, validatedTokenResult, reqBody, token } = await getAuthRouteData(
      clientPromise,
      req
    )

    if (validatedTokenResult.status !== 200) {
      logger.warn({ status: validatedTokenResult.status }, 'Unauthorized access attempt to favorites');
      return NextResponse.json(validatedTokenResult)
    }

    const userEmail = parseJwt(token as string).email;
    logger.info({ email: userEmail, productId: reqBody.productId }, 'User adding item to favorites');

    if (Object.keys(reqBody).length < 4) {
      logger.warn({ body: reqBody }, 'Favorites add failed: missing fields');
      return NextResponse.json({
        message: 'Not all fields passed',
        status: 404,
      })
    }

    const user = await db
      .collection('users')
      .findOne({ email: userEmail })

    const productItem = await db
      .collection(reqBody.category)
      .findOne({ _id: new ObjectId(reqBody.productId) })

    if (!productItem) {
      logger.error({ productId: reqBody.productId }, 'Product not found for favorites');
      return NextResponse.json({
        message: 'Wrong product id',
        status: 404,
      })
    }

    const newFavoriteItem = {
      userId: user?._id,
      productId: productItem._id,
      image: productItem.images[0],
      name: productItem.name,
      size: productItem.type === 'boxes' ? '' : reqBody.size,
      price: productItem.price,
      vendorCode: productItem.vendorCode,
      category: reqBody.category,
      clientId: reqBody.clientId,
    }

    const { insertedId } = await db
      .collection('favorites')
      .insertOne(newFavoriteItem)

    logger.info({ favoriteId: insertedId, email: userEmail }, 'Item added to favorites successfully');

    return NextResponse.json({
      status: 201,
      newFavoriteItem: { _id: insertedId, ...newFavoriteItem },
    })
  } catch (error) {
    logger.error(error, 'Error in favorites add API');
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}