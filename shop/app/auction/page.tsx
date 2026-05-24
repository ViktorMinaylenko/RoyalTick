'use client'
import dynamic from 'next/dynamic'

const AuctionPage = dynamic(
    () => import('@/components/templates/AuctionPage/AuctionPage'),
    { ssr: false, loading: () => null }
)

const Auction = () => <AuctionPage />

export default Auction