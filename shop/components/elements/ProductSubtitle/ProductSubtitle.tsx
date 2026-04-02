import { useLang } from '@/hooks/useLang'
import styles from '@/styles/productSubtitle/index.module.scss'
import { IProductSubtitleProps } from '@/types/elements'

function ProductSubtitle({
  subtitleClassName,
  subtitleRectClassName,
}: IProductSubtitleProps) {
  const { lang, translations } = useLang()
  const descriptionSlicePosition = lang === 'ua' ? 4 : 4

  return (
    <div
      className={subtitleClassName}
    >
      <div
        className={subtitleRectClassName}
      />
      <span>
        {translations[lang].main_page.hero_description.slice(
          0,
          descriptionSlicePosition
        )}
      </span>
      <br />
      <span>
        {translations[lang].main_page.hero_description.slice(
          descriptionSlicePosition
        )}
      </span>
    </div>
  )
}

export default ProductSubtitle
