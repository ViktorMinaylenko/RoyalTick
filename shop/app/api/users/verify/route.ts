import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { getAuthRouteData, parseJwt } from '@/lib/utils/api-routes'
import { corsHeaders } from '@/constants/corsHeaders'
import bcrypt from 'bcryptjs'

const isValidCardNumber = (number: string): boolean => {
    const digits = number.replace(/\D/g, '')
    if (digits.length < 13 || digits.length > 19) return false
    let sum = 0
    let isEven = false
    for (let i = digits.length - 1; i >= 0; i--) {
        let digit = parseInt(digits[i])
        if (isEven) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
        isEven = !isEven
    }
    return sum % 10 === 0
}

const isValidPhone = (phone: string): boolean =>
    /^(\+380|380|0)\d{9}$/.test(phone.replace(/[\s\-()]/g, ''))

export async function POST(req: Request) {
    try {
        const { db, validatedTokenResult, token } = await getAuthRouteData(
            clientPromise, req, false
        )

        if (validatedTokenResult.status !== 200) {
            return NextResponse.json({ status: 401, message: 'Unauthorized' }, corsHeaders)
        }

        const reqBody = await req.json()
        const { phone, cardNumber } = reqBody

        if (!isValidPhone(phone)) {
            return NextResponse.json({
                status: 400,
                message: 'Невірний формат номера телефону. Використовуйте формат +380XXXXXXXXX'
            }, corsHeaders)
        }

        if (!isValidCardNumber(cardNumber)) {
            return NextResponse.json({
                status: 400,
                message: 'Невірний номер картки. Перевірте правильність введених даних'
            }, corsHeaders)
        }

        const cleanPhone = phone.replace(/\D/g, '')
        const cleanCard = cardNumber.replace(/\D/g, '')
        const userData = parseJwt(token as string)

        const verifiedUsers = await db.collection('users').find(
            { isVerified: true },
            { projection: { verifiedPhone: 1, verifiedCard: 1, email: 1 } }
        ).toArray()

        for (const user of verifiedUsers) {
            if (user.email === userData.email) continue

            if (user.verifiedPhone && bcrypt.compareSync(cleanPhone, user.verifiedPhone)) {
                return NextResponse.json({
                    status: 400,
                    message: 'Цей номер телефону вже використовується для верифікації іншого акаунту'
                }, corsHeaders)
            }

            if (user.verifiedCard && bcrypt.compareSync(cleanCard, user.verifiedCard)) {
                return NextResponse.json({
                    status: 400,
                    message: 'Ця картка вже використовується для верифікації іншого акаунту'
                }, corsHeaders)
            }
        }

        const salt = bcrypt.genSaltSync(10)
        const hashedPhone = bcrypt.hashSync(cleanPhone, salt)
        const hashedCard = bcrypt.hashSync(cleanCard, salt)

        await db.collection('users').updateOne(
            { email: userData.email },
            {
                $set: {
                    isVerified: true,
                    verifiedPhone: hashedPhone,
                    verifiedCard: hashedCard,
                    verifiedAt: new Date(),
                },
            }
        )

        return NextResponse.json({ status: 200, message: 'Акаунт успішно верифіковано' }, corsHeaders)
    } catch (error) {
        return NextResponse.json({
            status: 500,
            message: (error as Error).message
        }, corsHeaders)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}