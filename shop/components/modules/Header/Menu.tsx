'use client'
import Logo from '@/components/elements/Logo/Logo'
import { AllowedLangs } from '@/constants/lang'
import { setLang } from '@/context/lang'
import { $isMainMenuOpen, closeMenu } from '@/context/modals'
import { useLang } from '@/hooks/useLang'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import { useUnit } from 'effector-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import MenuLinkItem from './MenuLinkItem'
import Accordion from '../Accordion/Accordion'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import BuyersListItems from './BuyersListItems'
import ContactsListItems from './ContactsListItems'

const Menu = () => {
  const [activelistId, setActiveListId] = useState(0)
  const menuIsOpen = useUnit($isMainMenuOpen)
  const { lang, translations } = useLang()
  const pathname = usePathname()

  const isMedia800 = useMediaQuery(800)
  const isMedia640 = useMediaQuery(640)

  const handleSwitchLang = (lang: string) => {
    setLang(lang as AllowedLangs)
    localStorage.setItem('lang', JSON.stringify(lang))
  }

  const handleSwitchLangToUa = () => handleSwitchLang('ua')
  const handleSwitchLangToEn = () => handleSwitchLang('en')

  const handleShowCatalogList = () => setActiveListId(1)
  const handleShowBuyersList = () => setActiveListId(2)
  const handleShowContactsList = () => setActiveListId(3)

  const handleCloseMenu = () => {
    removeOverflowHiddenFromBody()
    closeMenu()
    setActiveListId(0)
  }

  const handleRedirectToCatalog = (path: string) => {
    if (pathname.includes('/catalog')) {
      window.history.pushState({ path }, '', path)
      window.location.reload()
    }
    handleCloseMenu()
  }

  // 1. ГОДИННИКИ
  const watchesLinks = [
    { id: 1, text: translations[lang].comparison.classic, href: '/catalog/watches?offset=0&type=classic' },
    { id: 2, text: translations[lang].comparison.sport, href: '/catalog/watches?offset=0&type=sport' },
    { id: 3, text: translations[lang].comparison.premium, href: '/catalog/watches?offset=0&type=premium' },
    { id: 4, text: translations[lang].comparison.line, href: '/catalog/watches?offset=0&type=line' },
  ]

  // 2. РЕМІНЦІ
  const strapsLinks = [
    { id: 1, text: translations[lang].comparison.leather_strap, href: '/catalog/straps?offset=0&type=leather_strap' },
    { id: 2, text: translations[lang].comparison.metal_bracelet, href: '/catalog/straps?offset=0&type=metal_bracelet' },
    { id: 3, text: translations[lang].comparison.nato_strap, href: '/catalog/straps?offset=0&type=nato_strap' },
    { id: 4, text: translations[lang].comparison.rubber_strap, href: '/catalog/straps?offset=0&type=rubber_strap' },
    { id: 5, text: translations[lang].comparison.mesh_bracelet, href: '/catalog/straps?offset=0&type=mesh_bracelet' },
  ]

  // 3. КОРОБОЧКИ
  const boxesLinks = [
    { id: 1, text: translations[lang].comparison.boxes, href: '/catalog/boxes?offset=0&type=boxes' },
  ]

  // 4. НАБОРИ ДЛЯ ДОГЛЯДУ
  const careLinks = [
    { id: 1, text: translations[lang].comparison.basic, href: '/catalog/care?offset=0&type=basic' },
    { id: 2, text: translations[lang].comparison.professional, href: '/catalog/care?offset=0&type=professional' },
  ]

  return (
    <nav className={`nav-menu ${menuIsOpen ? 'open' : 'close'}`}>
      <div className='container nav-menu__container'>
        <div className={`nav-menu__logo ${menuIsOpen ? 'open' : ''}`}>
          <Logo />
        </div>
        <img
          className={`nav-menu__bg ${menuIsOpen ? 'open' : ''}`}
          src={`/img/menu-bg${isMedia640 ? '-small' : ''}.svg`}
          alt='menu background'
        />
        <button
          className={`btn-reset nav-menu__close ${menuIsOpen ? 'open' : ''}`}
          onClick={handleCloseMenu}
        ></button>
        <div className={`nav-menu__lang ${menuIsOpen ? 'open' : ''}`}>
          <button
            className={`btn-reset nav-menu__lang__btn ${lang === 'ua' ? 'lang-active' : ''}`}
            onClick={handleSwitchLangToUa}
          >UA</button>
          <button
            className={`btn-reset nav-menu__lang__btn ${lang === 'en' ? 'lang-active' : ''}`}
            onClick={handleSwitchLangToEn}
          >EN</button>
        </div>
        <ul className={`list-reset nav-menu__list ${menuIsOpen ? 'open' : ''}`}>
          {!isMedia800 && (
            <li className='nav-menu__list__item'>
              <button
                className='btn-reset nav-menu__list__item__btn'
                onMouseEnter={handleShowCatalogList}
              >
                {translations[lang].main_menu.catalog}
              </button>
              <AnimatePresence>
                {activelistId === 1 && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='list-reset nav-menu__accordion'
                  >
                    {/* КАТЕГОРІЯ: ГОДИННИКИ */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.watches}
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {watchesLinks.map((item) => (
                            <MenuLinkItem key={item.id} item={item} handleRedirectToCatalog={handleRedirectToCatalog} />
                          ))}
                        </ul>
                      </Accordion>
                    </li>

                    {/* КАТЕГОРІЯ: РЕМІНЦІ */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.straps}
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {strapsLinks.map((item) => (
                            <MenuLinkItem key={item.id} item={item} handleRedirectToCatalog={handleRedirectToCatalog} />
                          ))}
                        </ul>
                      </Accordion>
                    </li>

                    {/* КАТЕГОРІЯ: КОРОБОЧКИ */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.boxes}
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {boxesLinks.map((item) => (
                            <MenuLinkItem key={item.id} item={item} handleRedirectToCatalog={handleRedirectToCatalog} />
                          ))}
                        </ul>
                      </Accordion>
                    </li>

                    {/* КАТЕГОРІЯ: ДОГЛЯД */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.care}
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {careLinks.map((item) => (
                            <MenuLinkItem key={item.id} item={item} handleRedirectToCatalog={handleRedirectToCatalog} />
                          ))}
                        </ul>
                      </Accordion>
                    </li>
                  </motion.ul>
                )}
              </AnimatePresence>
            </li>
          )}

          {/* BUYERS */}
          <li className='nav-menu__list__item'>
            {!isMedia640 ? (
              <>
                <button className='btn-reset nav-menu__list__item__btn' onMouseEnter={handleShowBuyersList}>
                  {translations[lang].main_menu.buyers}
                </button>
                <AnimatePresence>
                  {activelistId === 2 && (
                    <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='list-reset nav-menu__accordion'>
                      <BuyersListItems />
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Accordion title={translations[lang].main_menu.buyers} titleClass='btn-reset nav-menu__list__item__btn'>
                <ul className='list-reset nav-menu__accordion__item__list'><BuyersListItems /></ul>
              </Accordion>
            )}
          </li>

          {/* CONTACTS */}
          <li className='nav-menu__list__item'>
            {!isMedia640 ? (
              <>
                <button className='btn-reset nav-menu__list__item__btn' onMouseEnter={handleShowContactsList}>
                  {translations[lang].main_menu.contacts}
                </button>
                <AnimatePresence>
                  {activelistId === 3 && (
                    <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='list-reset nav-menu__accordion'>
                      <ContactsListItems />
                    </motion.ul>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <Accordion title={translations[lang].main_menu.contacts} titleClass='btn-reset nav-menu__list__item__btn'>
                <ul className='list-reset nav-menu__accordion__item__list'><ContactsListItems /></ul>
              </Accordion>
            )}
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Menu