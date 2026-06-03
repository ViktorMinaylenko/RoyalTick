import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faScaleBalanced } from '@fortawesome/free-solid-svg-icons'
import styles from '@/styles/auction-rules/index.module.scss'
import { IPropsRules } from '@/types/auction'

const AuctionRulesHero = ({ t }: IPropsRules) => {
    const navLinks = [
        { href: '#how-it-works', label: t.nav_how },
        { href: '#for-sellers', label: t.nav_sellers },
        { href: '#for-buyers', label: t.nav_buyers },
        { href: '#chats', label: t.nav_chats },
        { href: '#ratings', label: t.nav_ratings },
        { href: '#rules', label: t.nav_rules },
        { href: '#tips', label: t.nav_tips },
        { href: '#faq', label: t.nav_faq },
    ]

    return (
        <div className={styles.hero}>
            <div className='container'>
                <div className={styles.hero__inner}>
                    <div className={styles.hero__badge}>
                        <FontAwesomeIcon icon={faScaleBalanced} />
                        {t.hero_badge}
                    </div>
                    <h1 className={styles.hero__title}>
                        {t.hero_title}
                        <span className={styles.hero__title_accent}>{t.hero_title_accent}</span>
                    </h1>
                    <p className={styles.hero__subtitle}>{t.hero_subtitle}</p>
                    <nav className={styles.hero__nav}>
                        {navLinks.map(({ href, label }) => (
                            <a key={href} href={href} className={styles.hero__nav_link}>
                                {label}
                            </a>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}

export default AuctionRulesHero