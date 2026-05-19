
import UserPage from '@/components/templates/UserPage/UserPage'
import { Suspense } from 'react'

const User = () => (
    <Suspense fallback={null}>
        <UserPage />
    </Suspense>
)

export default User