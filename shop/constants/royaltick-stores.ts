import { IRoyalTickAddressData } from '@/types/order'

export const royalTickStores: IRoyalTickAddressData[] = [
    {
        place_id: 'royaltick-kyiv-1',
        city: 'Kyiv',
        address_line1: 'вул. Хрещатик, 22',
        address_line2: 'ТРЦ "Глобус", 2 поверх',
        lat: 50.4501,
        lon: 30.5234,
        bbox: {
            lon1: 30.5184,
            lat1: 50.4451,
            lon2: 30.5284,
            lat2: 50.4551,
        },
    },
    {
        place_id: 'royaltick-kyiv-2',
        city: 'Kyiv',
        address_line1: 'вул. Велика Васильківська, 78',
        address_line2: 'ТРЦ "Dream Town", 1 поверх',
        lat: 50.4220,
        lon: 30.5196,
        bbox: {
            lon1: 30.5146,
            lat1: 50.4170,
            lon2: 30.5246,
            lat2: 50.4270,
        },
    },
    {
        place_id: 'royaltick-zhytomyr-1',
        city: 'Zhytomyr',
        address_line1: 'вул. Михайлівська, 10',
        address_line2: 'ТЦ "Житній ринок", 1 поверх',
        lat: 50.2547,
        lon: 28.6587,
        bbox: {
            lon1: 28.6537,
            lat1: 50.2497,
            lon2: 28.6637,
            lat2: 50.2597,
        },
    },
    {
        place_id: 'royaltick-lviv-1',
        city: 'Lviv',
        address_line1: 'пр. Свободи, 15',
        address_line2: 'ТРЦ "Forum Lviv", 3 поверх',
        lat: 49.8397,
        lon: 24.0297,
        bbox: {
            lon1: 24.0247,
            lat1: 49.8347,
            lon2: 24.0347,
            lat2: 49.8447,
        },
    },
]