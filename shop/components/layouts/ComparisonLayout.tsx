'use client'
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";
import { useLang } from "@/hooks/useLang";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumbs from "../modules/Breadcrumbs/Breadcrumbs";
import { $comparison, $comparisonFromLs, $shouldShowEmptyComparison } from "@/context/comparison";
import { useGoodsByAuth } from "@/hooks/useGoodsByAuth";
import HeadingWithCount from "../elements/HeadingWithCount/HeadingWithCount";
import { useComparisonLinks } from "@/hooks/useComparisonLinks";
import Skeleton from "../elements/Skeleton/Skeleton";
import ComparisonLinksList from "../modules/Comparison/ComparisonLinksList";
import EmptyPageContent from "../modules/EmptyPageContent/EmptyPageContent";
import { useUnit } from "effector-react";
import skeletonLinksStyles from '@/styles/comparison-links-skeleton/index.module.scss'
import styles from '@/styles/comparison/index.module.scss'
import skeletonListsStyles from '@/styles/comparison-list-skeleton/index.module.scss'
import comparisonSkeleton from '@/styles/comparison-skeleton/index.module.scss'
import { isUserAuth } from "@/lib/utils/common";
import { loginCheckFx } from "@/context/user";

const ComparisonLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMounted, setIsMounted] = useState(false)
    // const [dynamicTitle, setDynamicTitle] = useState('')
    // const { crumbText } = useCrumbText('comparison')
    const { lang, translations } = useLang()
    const { getDefaultTextGenerator, getTextGenerator } = useBreadcrumbs('comparison')
    const pathname = usePathname()
    const currentComparisonByAuth = useGoodsByAuth($comparison, $comparisonFromLs)
    const { availableItemLinks, linksSpinner } = useComparisonLinks()
    const shouldShowEmptyComparison = useUnit($shouldShowEmptyComparison)
    const loginCheckSpinner = useUnit(loginCheckFx.pending)
    const mainSpinner = isUserAuth() ? linksSpinner || loginCheckSpinner : linksSpinner

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const showSkeleton = !isMounted || mainSpinner
    

    // usePageTitle('comparison', dynamicTitle)

    // useEffect(() => {
    //     if (typeof window === 'undefined') return;
    //     const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
    //     if (!lastCrumb) return

    //     const productTypePathname = pathname.split('/comparison/')[1]
    //     const text = productTypePathname
    //         ? (translations[lang].comparison as { [index: string]: string })[productTypePathname]
    //         : crumbText

    //     setDynamicTitle(text || '')
    //     lastCrumb.textContent = text || crumbText
    // }, [crumbText, lang, pathname, translations])


    if (!isMounted) {
        return <div className="container"><Skeleton styles={skeletonLinksStyles} /></div>
    }

    return (
        <main>
            {!shouldShowEmptyComparison ? (<section>
                <Breadcrumbs
                    getDefaultTextGenerator={getDefaultTextGenerator}
                    getTextGenerator={getTextGenerator}
                />
                <div className="container">
                    <HeadingWithCount
                        count={currentComparisonByAuth.length}
                        title={translations[lang].comparison.main_heading}
                        spinner={showSkeleton}
                    />
                    {!(pathname === '/comparison') &&
                        (mainSpinner ? (
                            <Skeleton styles={skeletonLinksStyles} />
                        ) : (
                            <ComparisonLinksList
                                links={availableItemLinks}
                                className={styles.comparison_links}
                            />
                        ))}
                    <div>
                        {mainSpinner ? (
                            pathname === '/comparison' ? (
                                <Skeleton styles={comparisonSkeleton} />
                            ) : (
                                <Skeleton styles={skeletonListsStyles} />
                            )
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </section>) :
                (<section>
                    <div className='container'>
                        <EmptyPageContent
                            subtitle={translations[lang].common.comparison_empty}
                            description={translations[lang].common.comparison_empty_advice}
                            btnText={translations[lang].common.go_catalog}
                            bgClassName={styles.empty_bg}
                        />
                    </div>
                </section>)}
        </main>
    );
};

export default ComparisonLayout
