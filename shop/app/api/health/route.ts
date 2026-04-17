import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { logger } from '@/lib/logger'

export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db()

        await db.command({ ping: 1 })

        return NextResponse.json({
            status: 'Healthy',
            database: 'Connected',
            timestamp: new Date().toISOString(),
        })
    } catch (error) {
        logger.error(error, 'Health check failed')
        return NextResponse.json({
            status: 'Unhealthy',
            database: 'Disconnected'
        }, { status: 503 })
    }
}