'use client'
import dynamic from 'next/dynamic'

const CommunityPage = dynamic(
    () => import('@/components/templates/CommunityPage/CommunityPage'),
    { ssr: false, loading: () => null }
)

const Community = () => <CommunityPage />

export default Community