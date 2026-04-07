'use client'

import { $isCatalogMenuOpen, closeCatalogMenu } from '@/context/modals'
import { useLang } from '@/hooks/useLang'
import { useMenuAnimation } from '@/hooks/useMenuAnimation'
import { useStore, useUnit } from 'effector-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import Header from './Header'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import CatalogMenuButton from './CatalogMenuButton'
import CatalogMenuList from './CatalogMenuList'
import Accordion from '../Accordion/Accordion'
import Link from 'next/link'

const CatalogMenu = () => {
  const catalogMenuIsOpen = useUnit($isCatalogMenuOpen)
  const { lang, translations } = useLang()

  const [activeListId, setActiveListId] = useState(0)
  const { itemVariants, sideVariants, popupZIndex } = useMenuAnimation(
    2,
    catalogMenuIsOpen
  )

  const isMedia450 = useMediaQuery(450)


  const handleCloseMenu = () => {
    removeOverflowHiddenFromBody()
    closeCatalogMenu()
    setActiveListId(0)
  }

  const isActiveList = (id: number) => activeListId === id

  const items = [
    {
      id: 1,
      name: translations[lang].main_menu.watches,
      handler: () => setActiveListId(1),
      items: [
        { title: translations[lang].comparison.classic_watches, href: '/catalog/watches?offset=0&type=classic' },
        { title: translations[lang].comparison.premium_watches, href: '/catalog/watches?offset=0&type=premium' },
        { title: translations[lang].comparison.sport_watches, href: '/catalog/watches?offset=0&type=sport' },
        { title: translations[lang].comparison.line_watches, href: '/catalog/watches?offset=0&type=line' },
      ],
    },
    {
      id: 2,
      name: translations[lang].main_menu.straps,
      handler: () => setActiveListId(2),
      items: [
        { title: translations[lang].comparison.leather_strap, href: '/catalog/straps?offset=0&type=leather_strap' },
        { title: translations[lang].comparison.metal_bracelet, href: '/catalog/straps?offset=0&type=metal_bracelet' },
        { title: translations[lang].comparison.rubber_strap, href: '/catalog/straps?offset=0&type=rubber_strap' },
        { title: translations[lang].comparison.nato_strap, href: '/catalog/straps?offset=0&type=nato_strap' },
        { title: translations[lang].comparison.mesh_bracelet, href: '/catalog/straps?offset=0&type=mesh_bracelet' },
      ],
    },
    {
      id: 3,
      name: translations[lang].main_menu.boxes,
      handler: () => setActiveListId(3),
      items: [
        { title: translations[lang].comparison.boxes, href: '/catalog/boxes?offset=0&type=boxes' },
      ],
    },
    {
      id: 4,
      name: translations[lang].main_menu.care,
      handler: () => setActiveListId(4),
      items: [
        { title: translations[lang].comparison.basic, href: '/catalog/care?offset=0&type=basic' },
        { title: translations[lang].comparison.professional, href: '/catalog/care?offset=0&type=professional' },
      ],
    },
  ]

  return (
    <div className='catalog-menu' style={{ zIndex: popupZIndex }}>
      <AnimatePresence>
        {catalogMenuIsOpen && (
          <motion.aside
            initial={{ width: 0 }}
            animate={{ width: 'calc(100%)' }}
            exit={{ width: 0, transition: { delay: 0.7, duration: 0.3 } }}
            className='catalog-menu__aside'
          >
            <div className='catalog-menu__header'>
              <Header />
            </div>
            <motion.div
              className='catalog-menu__inner'
              initial='closed'
              animate='open'
              exit='closed'
              variants={sideVariants}
            >
              <motion.button
                className='btn-reset catalog-menu__close'
                variants={itemVariants}
                onClick={handleCloseMenu}
              />
              <motion.h2
                variants={itemVariants}
                className='catalog-menu__title'
              >
                {translations[lang].main_menu.catalog}
              </motion.h2>
              <ul className='list-reset catalog-menu__list'>
                {items.map(({ id, name, items, handler }) => {
                  const buttonProps = (isActive: boolean) => ({
                    handler: handler as VoidFunction,
                    name,
                    isActive,
                  })

                  const isCurrentList = (
                    showList: boolean,
                    currentId: number
                  ) => showList && id === currentId

                  return (
                    <motion.li
                      key={id}
                      variants={itemVariants}
                      className='catalog-menu__list__item'
                    >
                      {!isMedia450 && (
                        <>
                          {id === 1 && (
                            <CatalogMenuButton {...buttonProps(isActiveList(1))} />
                          )}
                          {id === 2 && (
                            <CatalogMenuButton {...buttonProps(isActiveList(2))} />
                          )}
                          {id === 3 && (
                            <CatalogMenuButton
                              {...buttonProps(isActiveList(3))}
                            />
                          )}
                          {id === 4 && (
                            <CatalogMenuButton
                              {...buttonProps(isActiveList(4))}
                            />
                          )}
                        </>
                      )}
                      {!isMedia450 && (
                        <AnimatePresence>
                          {isCurrentList(isActiveList(1), 1) && (
                            <CatalogMenuList items={items} />
                          )}
                          {isCurrentList(isActiveList(2), 2) && (
                            <CatalogMenuList items={items} />
                          )}
                          {isCurrentList(isActiveList(3), 3) && (
                            <CatalogMenuList items={items} />
                          )}
                          {isCurrentList(isActiveList(4), 4) && (
                            <CatalogMenuList items={items} />
                          )}
                        </AnimatePresence>
                      )}
                      {isMedia450 && (
                        <Accordion
                          title={name}
                          titleClass='btn-reset nav-menu__accordion__item__title'
                        >
                          <ul className='list-reset catalog__accordion__list'>
                            {items.map((item, i) => (
                              <li
                                key={i}
                                className='catalog__accordion__list__item'
                              >
                                <Link
                                  href={item.href}
                                  className='nav-menu__accordion__item__list__item__link'
                                  onClick={handleCloseMenu}
                                >
                                  {item.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </Accordion>
                      )}
                    </motion.li>
                  )
                })}
              </ul>
            </motion.div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CatalogMenu
