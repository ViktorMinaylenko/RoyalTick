'use client'
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs'
import Breadcrumbs from '../modules/Breadcrumbs/Breadcrumbs'
import styles from '@/styles/catalog/index.module.scss'
import { Suspense } from 'react'

const CatalogLayout = ({ children }: { children: React.ReactNode }) => {
    const { getDefaultTextGenerator, getTextGenerator } =
        useBreadcrumbs('catalog')

    return (
        <main>
            <Suspense fallback={null}>
                <Breadcrumbs
                    getDefaultTextGenerator={getDefaultTextGenerator}
                    getTextGenerator={getTextGenerator}
                />
            </Suspense>
            <section className={styles.catalog}>
                <div className='container'>{children}</div>
            </section>
        </main>
    )
}

export default CatalogLayout