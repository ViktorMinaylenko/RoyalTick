import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    try {
        const { city } = await req.json()
        console.log('Nova Poshta request for city:', city)

        const response = await fetch('https://api.novaposhta.ua/v2.0/json/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                apiKey: process.env.NEXT_PUBLIC_NOVA_POSHTA_API_KEY,
                modelName: 'Address',
                calledMethod: 'getWarehouses',
                methodProperties: {
                    CityName: city,
                    Limit: 10,
                    Language: 'UA',
                },
            }),
        })

        const data = await response.json()
        console.log('Nova Poshta response:', JSON.stringify(data).slice(0, 500))

        if (!data.success) {
            console.log('Nova Poshta errors:', data.errors)
            return NextResponse.json({ warehouses: [] }, { status: 200 })
        }
        const warehouses = data.data.map((item: any) => ({
            place_id: item.Ref,
            city: city,
            address_line1: item.ShortAddress,
            address_line2: item.Description,
            lat: parseFloat(item.Latitude),
            lon: parseFloat(item.Longitude),
            bbox: {
                lon1: parseFloat(item.Longitude) - 0.005,
                lat1: parseFloat(item.Latitude) - 0.005,
                lon2: parseFloat(item.Longitude) + 0.005,
                lat2: parseFloat(item.Latitude) + 0.005,
            },
        }))

        return NextResponse.json({ warehouses }, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message }, { status: 500 })
    }
}