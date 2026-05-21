import CreateTopicPage from '@/components/templates/CreateTopicPage/CreateTopicPage'
import { Suspense } from 'react'

const CreateTopic = () => (
    <Suspense fallback={null}>
        <CreateTopicPage />
    </Suspense>
)

export default CreateTopic