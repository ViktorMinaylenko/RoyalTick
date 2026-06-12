import CreateLotPage from '@/components/templates/CreateLotPage/CreateLotPage'
import { Suspense } from 'react'

const CreateLot = () => (
    <Suspense fallback={null}>
        <CreateLotPage />
    </Suspense>
)

export default CreateLot