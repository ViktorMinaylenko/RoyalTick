import Logo from '@/components/elements/Logo/Logo'
import { AllowedLangs } from '@/constants/lang'
import { setLang } from '@/context/lang'
import { $isMainMenuOpen, closeMenu } from '@/context/modals'
import { useLang } from '@/hooks/useLang'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import { useUnit } from 'effector-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { usePathname } from 'next/dist/client/components/navigation'
import MenuLinkItem from './MenuLinkItem'
import Accordion from '../Accordion/Accordion'
import Link from 'next/link'
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

  const handleSwitchLangToUa = () => {
    handleSwitchLang('ua')
  }
  const handleSwitchLangToEn = () => {
    handleSwitchLang('en')
  }

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

  const watchesLinks = [
    {
      id: 1,
      text: translations[lang].comparison.mens_watches,
      href: '/catalog/watches?offset=0&type=mens_watches',
    },
    {
      id: 2,
      text: translations[lang].comparison.womens_watches,
      href: '/catalog/watches?offset=0&type=womens_watches',
    },
    {
      id: 3,
      text: translations[lang].comparison.smart_watches,
      href: '/catalog/watches?offset=0&type=smart_watches',
    },
    {
      id: 4,
      text: translations[lang].comparison.mechanical_watches,
      href: '/catalog/watches?offset=0&type=mechanical_watches',
    },
  ]

  const typesLinks = [
    {
      id: 1,
      text: translations[lang].comparison.quartz_watches,
      href: '/catalog/watches?offset=0&type=quartz_watches',
    },
    {
      id: 2,
      text: translations[lang].comparison.automatic_watches,
      href: '/catalog/watches?offset=0&type=automatic_watches',
    },
    {
      id: 3,
      text: translations[lang].comparison.chronograph,
      href: '/catalog/watches?offset=0&type=chronograph',
    },
  ]

  const collectionsLinks = [
    {
      id: 1,
      text: translations[lang].comparison.luxury_watches,
      href: '/catalog/watches?offset=0&type=luxury_watches',
    },
    {
      id: 2,
      text: translations[lang].comparison.limited_edition,
      href: '/catalog/watches?offset=0&type=limited_edition',
    },
  ]

  const stylesLinks = [
    {
      id: 1,
      text: translations[lang].comparison.sport_watches,
      href: '/catalog/watches?offset=0&type=sport_watches',
    },
    {
      id: 2,
      text: translations[lang].comparison.vintage_watches,
      href: '/catalog/watches?offset=0&type=vintage_watches',
    },
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
            className={`btn-reset nav-menu__lang__btn ${
              lang === 'ua' ? 'lang-active' : ''
            }`}
            onClick={handleSwitchLangToUa}
          >
            UA
          </button>
          <button
            className={`btn-reset nav-menu__lang__btn ${
              lang === 'en' ? 'lang-active' : ''
            }`}
            onClick={handleSwitchLangToEn}
          >
            EN
          </button>
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
                    {/* WATCHES */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.watches}
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {watchesLinks.map(
                            (item: {
                              id: number
                              text: string
                              href: string
                            }) => (
                              <MenuLinkItem
                                key={item.id}
                                item={item}
                                handleRedirectToCatalog={
                                  handleRedirectToCatalog
                                }
                              />
                            )
                          )}
                        </ul>
                      </Accordion>
                    </li>

                    {/* WATCH TYPES */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.accessories} // або "Типи"
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {typesLinks.map(
                            (item: {
                              id: number
                              text: string
                              href: string
                            }) => (
                              <MenuLinkItem
                                key={item.id}
                                item={item}
                                handleRedirectToCatalog={
                                  handleRedirectToCatalog
                                }
                              />
                            )
                          )}
                        </ul>
                      </Accordion>
                    </li>

                    {/* COLLECTIONS / PREMIUM */}
                    <li className='nav-menu__accordion__item'>
                      <Accordion
                        title={translations[lang].main_menu.care} // або "Колекції / Преміум"
                        titleClass='btn-reset nav-menu__accordion__item__title'
                      >
                        <ul className='list-reset nav-menu__accordion__item__list'>
                          {collectionsLinks.map(
                            (item: {
                              id: number
                              text: string
                              href: string
                            }) => (
                              <MenuLinkItem
                                key={item.id}
                                item={item}
                                handleRedirectToCatalog={
                                  handleRedirectToCatalog
                                }
                              />
                            )
                          )}
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
            {!isMedia640 && (
              <button
                className='btn-reset nav-menu__list__item__btn'
                onMouseEnter={handleShowBuyersList}
              >
                {translations[lang].main_menu.buyers}
              </button>
            )}

            {!isMedia640 && (
              <AnimatePresence>
                {activelistId === 2 && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='list-reset nav-menu__accordion'
                  >
                    <BuyersListItems />
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
            {isMedia640 && (
              <Accordion
                title={translations[lang].main_menu.buyers}
                titleClass='btn-reset nav-menu__list__item__btn'
              >
                <ul className='list-reset nav-menu__accordion__item__list'>
                  <BuyersListItems />
                </ul>
              </Accordion>
            )}
          </li>

          {/* CONTACTS */}
          <li className='nav-menu__list__item'>
            {!isMedia640 && (
              <button
                className='btn-reset nav-menu__list__item__btn'
                onMouseEnter={handleShowContactsList}
              >
                {translations[lang].main_menu.contacts}
              </button>
            )}

            {!isMedia640 && (
              <AnimatePresence>
                {activelistId === 3 && (
                  <motion.ul
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='list-reset nav-menu__accordion'
                  >
                    <ContactsListItems />
                  </motion.ul>
                )}
              </AnimatePresence>
            )}
            {isMedia640 && (
              <Accordion
                title={translations[lang].main_menu.contacts}
                titleClass='btn-reset nav-menu__list__item__btn'
              >
                <ul className='list-reset nav-menu__accordion__item__list'>
                  <ContactsListItems />
                </ul>
              </Accordion>
            )}
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Menu
