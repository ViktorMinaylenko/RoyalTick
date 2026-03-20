import { useUnit } from 'effector-react'
import { closeAuthModalWhenSomeModalOpened } from '@/lib/utils/common'
import { $openQuickViewModal, $showSizeTable } from '@/context/modals'

const AuthPopupClose = () => {
  const openQuickViewModal = useUnit($openQuickViewModal)
  const showSizeTable = useUnit($showSizeTable)

  const closePopup = () =>
    closeAuthModalWhenSomeModalOpened(openQuickViewModal, showSizeTable)

  return <button className='btn-reset auth-popup__close' onClick={closePopup} />
}

export default AuthPopupClose
