'use client'
import '@/context/goods/index'
import '@/context/goods/state'
import '@/context/goods/init'
import '@/context/auth/init'
import '@/context/cart/init'
import '@/context/comparison/init'
import '@/context/favorites/init'
import '@/context/user/init'
import { useUnit } from 'effector-react'
import {
  closeQuickViewModal,
  openShareModal,
} from '@/context/modals'
import Layout from './Layout'
import {
  closeSizeTableByCheck,
  handlecloseAuthModal,
  handleCloseShareModal,
  removeOverflowHiddenFromBody,
} from '@/lib/utils/common'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import CookieAlert from '../modules/CookieAlert/CookieAlert'
import { motion } from 'framer-motion'
import { Next13ProgressBar } from 'next13-progressbar'
import '@/context/goods/index'
import { $openQuickViewModal, $shareModal, $showSizeTable } from '@/context/modals/state'
import { $openAuthPopup } from '@/context/auth/state'

const PagesLayout = ({ children }: { children: React.ReactNode }) => {
  const openQuickViewModal = useUnit($openQuickViewModal)
  const [cookieAlertOpen, setCookieAlertOpen] = useState(false)
  const showSizeTable = useUnit($showSizeTable)
  const openAuthModal = useUnit($openAuthPopup)
    const openShareModal = useUnit($shareModal)

  const handleCloseQuickViewModal = () => {
    removeOverflowHiddenFromBody()
    closeQuickViewModal()
  }

  const handleCloseSizeTable = () => closeSizeTableByCheck(openQuickViewModal)

  useEffect(() => {
    const checkCookie = document.cookie.indexOf('CookieBy=RoyalTick')
    checkCookie != -1
      ? setCookieAlertOpen(false)
      : setTimeout(() => setCookieAlertOpen(true), 3000)
  }, [])

  return (
    <html lang='en'>
      <body>
        <Next13ProgressBar height='4px' color='#9466FF' showOnShallow />
        <Layout>{children}</Layout>
        <div
          className={`quick-view-modal-overlay ${openQuickViewModal ? 'overlay-active' : ''}`}
          onClick={handleCloseQuickViewModal}
        />
        <div
          className={`quick-view-modal-overlay ${showSizeTable ? 'overlay-active' : ''}`}
          onClick={handleCloseSizeTable}
        />
        <div
          className={`share-overlay ${openShareModal ? 'overlay-active' : ''}`}
          onClick={handleCloseShareModal}
        />
        <div
          className={`auth-overlay ${openAuthModal ? 'overlay-active' : ''}`}
          onClick={handlecloseAuthModal}
        />

        {cookieAlertOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className='cookie-popup'
          >
            <CookieAlert setCookieAlertOpen={setCookieAlertOpen} />
          </motion.div>
        )}

        <Toaster position='top-center' reverseOrder={false} />
      </body>
    </html>
  )
}

export default PagesLayout
