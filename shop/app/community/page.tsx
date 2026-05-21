import CommunityPage from '@/components/templates/CommunityPage/CommunityPage'
import { Suspense } from 'react'

const Community = () => (
    <Suspense fallback={null}>
        <CommunityPage />
    </Suspense>
)

export default Community