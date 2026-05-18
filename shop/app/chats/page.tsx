import ChatsPage from '@/components/templates/ChatsPage/ChatsPage'
import { Suspense } from 'react'

const Chats = () => (
    <Suspense fallback={null}>
        <ChatsPage />
    </Suspense>
)

export default Chats