import { ObjectId } from 'mongodb'
import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData, parseJwt } from '@/lib/utils/api-routes'

export async function POST(req: Request) {
  try {
    const { db, validatedTokenResult, reqBody, token } = await getAuthRouteData(
      clientPromise,
      req
    )

    if (validatedTokenResult.status !== 200) {
      return NextResponse.json(validatedTokenResult)
    }

    if (Object.keys(reqBody).length < 4) {
      return NextResponse.json({
        message: 'Not all fields passed',
        status: 404,
      })
    }

    const requiredFields = ['productId', 'category', 'count', 'clientId']
    for (const field of requiredFields) {
      if (!reqBody[field]) {
        return NextResponse.json({
          message: `Field "${field}" is missing`,
          status: 400,
        })
      }
    }

    const user = await db
      .collection('users')
      .findOne({ email: parseJwt(token as string).email })

    const collectionName =
      reqBody.category === 'accessories' ? 'boxes' : reqBody.category
    const productItem = await db
      .collection(collectionName)
      .findOne({ _id: new ObjectId(reqBody.productId) })

    if (!productItem) {
      return NextResponse.json({
        message: 'Product not found in database',
        status: 404,
      })
    }
    const newCartItem = {
      userId: user?._id,
      productId: productItem._id,
      image: productItem.images[0],
      name: productItem.name,
      vendorCode: productItem.vendorCode,
      category: productItem.category,
      count: reqBody.count,
      price: productItem.price,
      totalPrice: productItem.price * reqBody.count,
      inStock: productItem.inStock,
      clientId: reqBody.clientId,
      material: productItem.characteristics?.material || '',
      size:
        reqBody.size ||
        (productItem.characteristics
          ? productItem.category === 'straps'
            ? `${productItem.characteristics.width} / ${productItem.characteristics.length}`
            : `${productItem.characteristics.caseSize}`
          : ''),
    }

    const { insertedId } = await db.collection('cart').insertOne(newCartItem)

    return NextResponse.json({
      status: 201,
      newCartItem: { _id: insertedId, ...newCartItem },
    })
  } catch (error) {
    return NextResponse.json({
      status: 500,
      message: (error as Error).message,
    })
  }
}
