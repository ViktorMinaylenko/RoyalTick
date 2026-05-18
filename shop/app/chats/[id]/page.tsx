import ChatPage from '@/components/templates/ChatPage/ChatPage'
import { Suspense } from 'react'

const Chat = () => (
    <Suspense fallback={null}>
        <ChatPage />
    </Suspense>
)

export default Chat