'use client'
import { useEffect } from 'react'
import { useLang } from './useLang'

export const usePageTitle = (page: string, additionalText = '') => {
  const { lang, translations } = useLang()

  useEffect(() => {
    const pageTitle = (
      translations[lang].breadcrumbs as Record<string, string>
    )[page]
    const suffix = additionalText ? ` - ${additionalText}` : ''

    document.title = `RoyalTick | ${pageTitle}${suffix}`
  }, [additionalText, lang, page, translations])
}
