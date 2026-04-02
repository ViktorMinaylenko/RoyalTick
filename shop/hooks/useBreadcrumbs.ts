import { useCallback, useEffect, useState } from 'react'
import { usePageTitle } from './usePageTitle'
import { useCrumbText } from './useCrumbText'
import { useLang } from './useLang'
import { usePathname } from 'next/navigation'

export const useBreadcrumbs = (page: string) => {
  const [dynamicTitle, setDynamicTitle] = useState('')
  const { lang, translations } = useLang()
  const pathname = usePathname()
  const { crumbText } = useCrumbText(page)
  const getDefaultTextGenerator = useCallback(() => crumbText, [crumbText])
  const getTextGenerator = useCallback((param: string) => ({})[param], [])
  usePageTitle(page, dynamicTitle)

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
    if (!lastCrumb) return

    const productTypePathname = pathname.split(`/${page}/`)[1]
    const text = productTypePathname
      ? (translations[lang][page === 'comparison' ? 'comparison' : 'breadcrumbs'] as { [index: string]: string })[productTypePathname]
      : crumbText

    setDynamicTitle(text || '')
    lastCrumb.textContent = text || crumbText
  }, [crumbText, lang, pathname, translations, page])

  return { getDefaultTextGenerator, getTextGenerator }
}
