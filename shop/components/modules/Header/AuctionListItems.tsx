import { useLang } from '@/hooks/useLang'
import Link from 'next/link'

const AuctionListItems = ({ handleCloseMenu }: { handleCloseMenu: () => void }) => {
    const { lang, translations } = useLang()
    const t = translations[lang] as any

    return (
        <>
            <li className='nav-menu__accordion__item'>
                <Link
                    href='/auction'
                    className='nav-menu__accordion__item__link nav-menu__accordion__item__title'
                    onClick={handleCloseMenu}
                >
                    {translations[lang].main_menu.auction}
                </Link>
            </li>

            <li className='nav-menu__accordion__item'>
                <Link
                    href='/community'
                    className='nav-menu__accordion__item__link'
                    onClick={handleCloseMenu}
                >
                    {t.main_menu.community || 'Спільнота'}
                </Link>
            </li>
        </>
    )
}

export default AuctionListItems