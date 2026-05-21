import { useLang } from '@/hooks/useLang'
import styles from '@/styles/community/index.module.scss'

const CategorySidebar = ({
    active,
    onChange,
}: {
    active: string
    onChange: (cat: string) => void
}) => {
    const { lang, translations } = useLang()
    const t = (translations[lang] as any).community

    const CATEGORIES = [
        t.categories.valuation,
        t.categories.watches,
        t.categories.straps,
        t.categories.care,
        t.categories.auction,
        t.categories.trade,
        t.categories.general,
    ]

    return (
        <aside className={styles.sidebar}>
            <h2 className={styles.sidebar__title}>{t.sections}</h2>
            <ul className={styles.sidebar__list}>
                <li
                    className={`${styles.sidebar__item} ${!active ? styles.sidebar__item_active : ''}`}
                    onClick={() => onChange('')}
                >
                    {t.all_categories}
                </li>
                {CATEGORIES.map((cat) => (
                    <li
                        key={cat}
                        className={`${styles.sidebar__item} ${active === cat ? styles.sidebar__item_active : ''}`}
                        onClick={() => onChange(cat)}
                    >
                        {cat}
                    </li>
                ))}
            </ul>
        </aside>
    )
}

export default CategorySidebar