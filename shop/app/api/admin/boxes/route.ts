import clientPromise from '@/lib/mongodb'
import { getFilteredCollection } from '@/lib/utils/admin-routes'
import { NextResponse } from 'next/server'
import { corsHeaders } from '@/constants/corsHeaders'

export async function GET(req: Request) {
    try {
        return getFilteredCollection('boxes', clientPromise, req)
    } catch (error) {
        throw new Error((error as Error).message)
    }
}

export async function OPTIONS() {
    return new NextResponse(null, { ...corsHeaders, status: 200 })
}

export const dynamic = 'force-dynamic'