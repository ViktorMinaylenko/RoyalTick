import ModeratorPage from '@/components/templates/ModeratorPage/ModeratorPage'
import { Suspense } from 'react'

const Moderator = () => (
    <Suspense fallback={null}>
        <ModeratorPage />
    </Suspense>
)

export default Moderator