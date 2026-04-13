/* eslint-disable max-len */
import Link from 'next/link'
import { useMemo } from 'react'
import Crumb from './Crumb'
import { useLang } from '@/hooks/useLang'
import { usePathname, useSearchParams } from 'next/navigation'
import { IBreadcrumbsProps } from '@/types/modules'

const generatePathParts = (pathStr: string) => {
  const pathWithoutQuery = pathStr.split('?')[0]
  return pathWithoutQuery.split('/').filter((v) => v.length > 0)
}

const Breadcrumbs = ({
  getTextGenerator,
  getDefaultTextGenerator,
}: IBreadcrumbsProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang, translations } = useLang()

  const breadcrumbs = useMemo(
    function generateBreadcrumbs() {
      const asPathNestedRoutes = generatePathParts(pathname)
      const pathnameNestedRoutes = generatePathParts(pathname)

      return asPathNestedRoutes
        .map((subpath, idx) => {
          const param = pathnameNestedRoutes[idx]
            .replace('[', '')
            .replace(']', '')

          const href = '/' + asPathNestedRoutes.slice(0, idx + 1).join('/')

          return {
            href,
            textGenerator: getTextGenerator(param, searchParams.getAll('')),
            text: getDefaultTextGenerator(subpath, href),
          }
        })
        // КЛЮЧОВИЙ МОМЕНТ: видаляємо порожні сегменти, щоб не було "Каталог • Каталог"
        .filter((crumb) => crumb.text !== '')
    },
    [pathname, getTextGenerator, searchParams, getDefaultTextGenerator, lang]
  )

  return (
    <div className='container breadcrumbs__container'>
      <ul className='list-reset breadcrumbs'>
        <li className='breadcrumbs__item'>
          <Link href='/' className='breadcrumbs__item__link first-crumb'>
            <span>{translations[lang].breadcrumbs.main}</span>
          </Link>
        </li>
        {breadcrumbs.map((crumb, idx) => (
          <li key={idx} className='breadcrumbs__item'>
            {/**eslint-disable-next-line @typescript-eslint/ban-ts-comment
             * @ts-ignore */}
            <Crumb
              {...crumb}
              key={idx}
              last={idx === breadcrumbs.length - 1}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Breadcrumbs