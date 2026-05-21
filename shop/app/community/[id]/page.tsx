import TopicPage from '@/components/templates/TopicPage/TopicPage'
import { Suspense } from 'react'

const Topic = () => (
    <Suspense fallback={null}>
        <TopicPage />
    </Suspense>
)

export default Topic