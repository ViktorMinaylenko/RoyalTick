import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'
import clientPromise from '@/lib/mongodb'
import { getDbAndReqBody, isValidAccessToken, parseJwt, findUserByEmail } from '@/lib/utils/api-routes'
import { ObjectId } from 'mongodb'

const EMOJIS = ['😠', '😕', '😐', '🙂', '😄']

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = req.headers.get('authorization')?.split(' ')[1]
    const validatedTokenResult = await isValidAccessToken(token)
    if (validatedTokenResult.status !== 200) {
      return NextResponse.json(validatedTokenResult, corsHeaders)
    }

    const { db, reqBody } = await getDbAndReqBody(clientPromise, req)
    const { rating, comment, skipped } = reqBody
    const user = await findUserByEmail(db, parseJwt(token as string).email)
    const chat = await db.collection('chats').findOne({ _id: new ObjectId(id) })

    if (!chat) {
      return NextResponse.json({ message: 'Чат не знайдено', status: 404 }, corsHeaders)
    }

    const isOwner = String(chat.ownerId) === String(user?._id)
    const isWinner = String(chat.winnerId) === String(user?._id)

    if (!isOwner && !isWinner) {
      return NextResponse.json({ message: 'Немає доступу', status: 403 }, corsHeaders)
    }

    if (isOwner && chat.ownerRatedBuyer) {
      return NextResponse.json({ message: 'Ви вже оцінили покупця', status: 400 }, corsHeaders)
    }
    if (isWinner && chat.winnerRatedSeller) {
      return NextResponse.json({ message: 'Ви вже оцінили продавця', status: 400 }, corsHeaders)
    }

    const systemText = skipped
      ? `${user?.name} пропустив(ла) оцінку`
      : `${user?.name} залишив(ла) відгук: ${EMOJIS[rating - 1]} (${rating}/5)${comment ? ` — «${comment}»` : ''}`

    const systemMessage = {
      _id: new ObjectId(),
      senderId: 'system',
      senderName: 'system',
      text: systemText,
      isSystem: true,
      createdAt: new Date(),
      isRead: true,
    }

    if (!skipped && rating > 0) {
      const review = {
        fromUserId: user?._id,
        fromUserName: user?.name,
        rating,
        comment: comment?.trim() || '',
        lotTitle: chat.lotTitle,
        createdAt: new Date(),
      }

      if (isOwner) {
        const winner = await db.collection('users').findOne({
          _id: new ObjectId(String(chat.winnerId))
        })
        if (winner) {
          const newCount = (winner.buyerRatingsCount || 0) + 1
          const newRating = ((winner.buyerRating || 0) * (newCount - 1) + rating) / newCount
          await db.collection('users').updateOne(
            { _id: winner._id },
            {
              $set: { buyerRating: +newRating.toFixed(2), buyerRatingsCount: newCount },
              $push: { buyerReviews: review } as any,
            }
          )
        }
      } else {
        const owner = await db.collection('users').findOne({
          _id: new ObjectId(String(chat.ownerId))
        })
        if (owner) {
          const newCount = (owner.sellerRatingsCount || 0) + 1
          const newRating = ((owner.sellerRating || 0) * (newCount - 1) + rating) / newCount
          await db.collection('users').updateOne(
            { _id: owner._id },
            {
              $set: { sellerRating: +newRating.toFixed(2), sellerRatingsCount: newCount },
              $push: { sellerReviews: review } as any,
            }
          )
        }
      }
    }

    const ratedField = isOwner ? 'ownerRatedBuyer' : 'winnerRatedSeller'
    await db.collection('chats').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: { [ratedField]: true },
        $push: { messages: systemMessage } as any,
      }
    )

    const updatedChat = await db.collection('chats').findOne({ _id: new ObjectId(id) })
    return NextResponse.json({ status: 200, chat: updatedChat }, corsHeaders)
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message, status: 500 }, corsHeaders)
  }
}

export const dynamic = 'force-dynamic'