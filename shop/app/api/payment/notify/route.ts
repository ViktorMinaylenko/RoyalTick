import { sendMail } from "@/service/mailService"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const reqBody = await req.json()
        const { email, orderReference, amount, description, orderDetails, cartItems } = reqBody

        const recipientEmail = orderDetails?.email_label || email

        const cartHtml = cartItems?.map((item: any, i: number) => `
            ${i + 1}. ${item.name}
            - Розмір: ${item.size || '-'}
            - Кількість: ${item.count} шт.
            - Ціна: ${item.price} ₴
            - Сума: ${+item.price * +item.count} ₴
        `).join('\n') || ''

        const message = `
Дякуємо за замовлення в RoyalTick!

Номер замовлення: №${orderReference}
Сума: ${amount} ₴

Отримувач:
Ім'я: ${orderDetails?.name_label || ''} ${orderDetails?.surname_label || ''}
Телефон: ${orderDetails?.phone_label || ''}

Спосіб доставки:
${description}

Склад замовлення:
${cartHtml}

${orderDetails?.message_label ? `Коментар: ${orderDetails.message_label}` : ''}

З повагою,
Команда RoyalTick
        `.trim()

        await sendMail('Підтвердження замовлення RoyalTick', recipientEmail, message)

        return NextResponse.json({ status: 200 })
    } catch (error) {
        console.error('Mail error:', error)
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}