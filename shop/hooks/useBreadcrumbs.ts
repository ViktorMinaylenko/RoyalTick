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
  const [isMounted, setIsMounted] = useState(false)

  // Стан для DOM-елемента
  const [breadcrumbs, setBreadcrumbs] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
    setBreadcrumbs(document.querySelector('.breadcrumbs') as HTMLElement)
  }, [pathname])

  const getDefaultTextGenerator = useCallback(() => crumbText, [crumbText])

  const getTextGenerator = useCallback((param: string) => {
    // Якщо ми ще на сервері, повертаємо порожній рядок, щоб уникнути Hydration Error
    // Або повертаємо crumbText, ЯКЩО впевнені, що сервер і клієнт видадуть однакове
    if (!isMounted) return ''

    const breadcrumbsTranslations = translations[lang].breadcrumbs as Record<string, string>

    // Шукаємо переклад для сегмента (watches, straps і т.д.)
    const translation = breadcrumbsTranslations[param]
    if (translation) return translation

    // Спеціальна логіка для кореня каталогу
    if (param === 'catalog') return breadcrumbsTranslations.catalog

    return crumbText
  }, [lang, translations, crumbText, isMounted])

  usePageTitle(page, dynamicTitle)

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted) return

    const pathParts = pathname.split('/').filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]

    // Логіка визначення тексту для останньої крихти
    const breadcrumbsTranslations = translations[lang].breadcrumbs as Record<string, string>
    const text = breadcrumbsTranslations[lastPart] || crumbText

    setDynamicTitle(text)

    // Маніпуляція DOM
    const lastCrumb = document.querySelector('.last-crumb') as HTMLElement
    if (lastCrumb) {
      lastCrumb.textContent = text
    }
  }, [crumbText, lang, pathname, translations, page, isMounted])

  return { getDefaultTextGenerator, getTextGenerator, breadcrumbs }
}