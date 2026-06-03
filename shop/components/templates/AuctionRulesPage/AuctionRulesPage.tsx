'use client'
import { useState } from 'react'
import { useLang } from '@/hooks/useLang'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
    faGavel, faShieldHalved, faComments, faStar,
    faTriangleExclamation, faLightbulb, faChevronDown,
    faCircleCheck, faCircleXmark, faUserTie,
    faScaleBalanced, faQuestion, faCheck,
} from '@fortawesome/free-solid-svg-icons'
import AuctionRulesHero from '@/components/modules/AuctionRules/AuctionRulesHero/AuctionRulesHero'
import styles from '@/styles/auction-rules/index.module.scss'


const Section = ({
    id, icon, title, intro, accent = false, children,
}: {
    id: string
    icon: any
    title: string
    intro?: string
    accent?: boolean
    children: React.ReactNode
}) => (
    <section id={id} className={`${styles.section} ${accent ? styles.section_accent : ''}`}>
        <div className={styles.section__header}>
            <div className={styles.section__icon}>
                <FontAwesomeIcon icon={icon} />
            </div>
            <h2 className={styles.section__title}>{title}</h2>
        </div>
        {intro && <p className={styles.section__intro}>{intro}</p>}
        {children}
    </section>
)

const Step = ({ number, title, text }: { number: number; title: string; text: string }) => (
    <div className={styles.step}>
        <div className={styles.step__number}>{number}</div>
        <div className={styles.step__line} />
        <div className={styles.step__content}>
            <h4 className={styles.step__title}>{title}</h4>
            <p className={styles.step__text}>{text}</p>
        </div>
    </div>
)

const RuleCard = ({
    type, title, text,
}: {
    type: 'allowed' | 'forbidden' | 'warning'
    title: string
    text: string
}) => {
    const icons = {
        allowed: faCircleCheck,
        forbidden: faCircleXmark,
        warning: faTriangleExclamation,
    }
    return (
        <div className={`${styles.rule_card} ${styles[`rule_card_${type}`]}`}>
            <FontAwesomeIcon icon={icons[type]} className={styles.rule_card__icon} />
            <div>
                <h4 className={styles.rule_card__title}>{title}</h4>
                <p className={styles.rule_card__text}>{text}</p>
            </div>
        </div>
    )
}

const PunishmentCard = ({
    level, title, actions, consequences, labels,
}: {
    level: 1 | 2 | 3
    title: string
    actions: string[]
    consequences: string[]
    labels: { actions: string; consequences: string }
}) => (
    <div className={`${styles.punishment} ${styles[`punishment_${level}`]}`}>
        <div className={styles.punishment__header}>
            <div className={styles.punishment__icons}>
                {Array.from({ length: level }).map((_, i) => (
                    <FontAwesomeIcon key={i} icon={faTriangleExclamation} />
                ))}
            </div>
            <h4 className={styles.punishment__title}>{title}</h4>
        </div>
        <div className={styles.punishment__body}>
            <div>
                <p className={styles.punishment__label}>{labels.actions}</p>
                <ul className={styles.punishment__list}>
                    {actions.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
            </div>
            <div>
                <p className={styles.punishment__label}>{labels.consequences}</p>
                <ul className={styles.punishment__list}>
                    {consequences.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
            </div>
        </div>
    </div>
)

const Accordion = ({ question, answer }: { question: string; answer: string }) => {
    const [open, setOpen] = useState(false)
    return (
        <div className={`${styles.accordion} ${open ? styles.accordion_open : ''}`}>
            <button className={`btn-reset ${styles.accordion__btn}`} onClick={() => setOpen(!open)}>
                <span>{question}</span>
                <FontAwesomeIcon icon={faChevronDown} className={styles.accordion__arrow} />
            </button>
            {open && <p className={styles.accordion__answer}>{answer}</p>}
        </div>
    )
}


const AuctionRulesPage = () => {
    const { lang, translations } = useLang()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (translations[lang] as any).auction_rules

    const punishmentLabels = {
        actions: lang === 'ua' ? 'Порушення:' : 'Violations:',
        consequences: lang === 'ua' ? 'Наслідки:' : 'Consequences:',
    }

    const tipIcons = [faShieldHalved, faStar, faCircleCheck, faComments, faCheck, faLightbulb]

    return (
        <main className={styles.page}>
            <AuctionRulesHero t={t} />

            <div className='container'>

                <Section id='how-it-works' icon={faGavel} title={t.how_title} intro={t.how_intro}>
                    <div className={styles.steps}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <Step key={n} number={n} title={t[`step_${n}_title`]} text={t[`step_${n}_text`]} />
                        ))}
                    </div>
                </Section>

                <Section id='for-sellers' icon={faUserTie} title={t.sellers_title} intro={t.sellers_intro} accent>
                    <div className={styles.cards_grid}>
                        <RuleCard type='allowed' title={t.sellers_allowed_title} text={t.sellers_allowed_text} />
                        <RuleCard type='forbidden' title={t.sellers_forbidden_title} text={t.sellers_forbidden_text} />
                        <RuleCard type='warning' title={t.sellers_warning_title} text={t.sellers_warning_text} />
                    </div>
                    <p className={styles.subsection_title}>{t.sellers_tips_title}</p>
                    <div className={styles.checklist}>
                        {[1, 2, 3, 4, 5].map(n => (
                            <div key={n} className={styles.checklist__item}>
                                <FontAwesomeIcon icon={faCheck} />
                                <span>{t[`sellers_tip_${n}`]}</span>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section id='for-buyers' icon={faShieldHalved} title={t.buyers_title} intro={t.buyers_intro}>
                    <div className={styles.cards_grid}>
                        <RuleCard type='warning' title={t.buyers_verification_title} text={t.buyers_verification_text} />
                    </div>
                    <p className={styles.subsection_title}>{t.buyers_bid_title}</p>
                    <div className={styles.bid_rules}>
                        {[1, 2, 3, 4].map(n => (
                            <div key={n} className={styles.bid_rules__item}>
                                <span className={styles.bid_rules__num}>0{n}</span>
                                <span>{t[`buyers_bid_${n}`]}</span>
                            </div>
                        ))}
                    </div>
                    <div className={styles.win_block}>
                        <p className={styles.win_block__title}>{t.buyers_win_title}</p>
                        <p className={styles.win_block__text}>{t.buyers_win_text}</p>
                    </div>
                </Section>

                <Section id='chats' icon={faComments} title={t.chats_title} intro={t.chats_intro} accent>
                    <div className={styles.cards_grid}>
                        {[1, 2, 3].map(n => (
                            <div key={n} className={styles.chat_card}>
                                <h4 className={styles.chat_card__title}>{t[`chats_rule_${n}_title`]}</h4>
                                <p className={styles.chat_card__text}>{t[`chats_rule_${n}_text`]}</p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.warning_banner}>
                        <FontAwesomeIcon icon={faTriangleExclamation} />
                        <span>{t.chats_warning}</span>
                    </div>
                </Section>

                <Section id='ratings' icon={faStar} title={t.ratings_title} intro={t.ratings_intro}>
                    <div className={styles.cards_grid}>
                        {['seller', 'buyer', 'new'].map(key => (
                            <div key={key} className={styles.rating_card}>
                                <h4 className={styles.rating_card__title}>{t[`ratings_${key}_title`]}</h4>
                                <p className={styles.rating_card__text}>{t[`ratings_${key}_text`]}</p>
                            </div>
                        ))}
                    </div>
                    <div className={styles.info_banner}>
                        <FontAwesomeIcon icon={faLightbulb} />
                        <span>{t.ratings_tip}</span>
                    </div>
                </Section>

                <Section id='rules' icon={faScaleBalanced} title={t.punishments_title} intro={t.punishments_intro} accent>
                    {([1, 2, 3] as (1 | 2 | 3)[]).map(level => (
                        <PunishmentCard
                            key={level}
                            level={level}
                            title={t[`punishment_${level}_title`]}
                            actions={t[`punishment_${level}_actions`]}
                            consequences={t[`punishment_${level}_consequences`]}
                            labels={punishmentLabels}
                        />
                    ))}
                </Section>

                <Section id='tips' icon={faLightbulb} title={t.tips_title}>
                    <div className={styles.tips_grid}>
                        {[1, 2, 3, 4, 5, 6].map((n, i) => (
                            <div key={n} className={styles.tip_card}>
                                <div className={styles.tip_card__icon}>
                                    <FontAwesomeIcon icon={tipIcons[i]} />
                                </div>
                                <h4 className={styles.tip_card__title}>{t[`tip_${n}_title`]}</h4>
                                <p className={styles.tip_card__text}>{t[`tip_${n}_text`]}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                <Section id='faq' icon={faQuestion} title={t.faq_title} accent>
                    <div className={styles.faq}>
                        {[1, 2, 3, 4, 5, 6, 7].map(n => (
                            <Accordion key={n} question={t[`faq_${n}_q`]} answer={t[`faq_${n}_a`]} />
                        ))}
                    </div>
                </Section>

            </div>
        </main>
    )
}

export default AuctionRulesPage