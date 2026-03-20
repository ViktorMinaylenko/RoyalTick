'use client'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import Header from '../modules/Header/Header'
import MobileNavbar from '../modules/MobileNavBar/MobileNavBar'
import { AnimatePresence, motion } from 'framer-motion'
import SearchModal from '../modules/Header/SearchModal'
import {
  $searchModal,
  $openQuickViewModal,
  $showSizeTable,
} from '@/context/modals'
import { useUnit } from 'effector-react'
import {
  handlecloseAuthModal,
  handleCloseSearchModal,
} from '@/lib/utils/common'
import Footer from '../modules/Footer/Footer'
import QuickViewModal from '../modules/QuickViewModal/QuickViewModal'
import SizeTable from '../modules/SizeTable/SizeTable'
import { $openAuthPopup } from '@/context/auth'
import AuthPopup from '../modules/AuthPopup/AuthPopup'
import { MutableRefObject, useRef } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isMedia800 = useMediaQuery(800)
  const searchModal = useUnit($searchModal)
  const openQuickViewModal = useUnit($openQuickViewModal)
  const showSizeTable = useUnit($showSizeTable)
  const openAuthModal = useUnit($openAuthPopup)
  const authWrapperRef = useRef<HTMLDivElement>(null)

  const handlecloseAuthModalByTarget = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const target = e.target as Element

    if (target === authWrapperRef.current) {
      handlecloseAuthModal()
    }
  }

  return (
    <>
      <Header />
      {children}
      {isMedia800 && <MobileNavbar />}
      <AnimatePresence>
        {openAuthModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className='auth-popup-wrapper'
            onClick={handlecloseAuthModalByTarget}
            ref={authWrapperRef}
          >
            <AuthPopup />
          </motion.div>
        )}
        {searchModal && (
          <motion.div
            initial={{ opacity: 0, zIndex: 102 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SearchModal />
          </motion.div>
        )}
        {showSizeTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SizeTable />
          </motion.div>
        )}
      </AnimatePresence>
      {!isMedia800 && (
        <AnimatePresence>
          {openQuickViewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuickViewModal />
            </motion.div>
          )}
        </AnimatePresence>
      )}
      <div
        className={`header__search-overlay ${searchModal ? 'overlay-active' : ''}`}
        onClick={handleCloseSearchModal}
      ></div>
      <Footer />
    </>
  )
}

export default Layout
