'use client'
import { useUnit } from 'effector-react'
import { $openQuickViewModal, showSizeTable } from '@/context/modals'
import { addOverflowHiddenToBody } from '@/lib/utils/common'
import { ISelectedSizes } from '@/types/common'
import { setSizeTableSizes } from '@/context/sizeTable'
import { useLang } from '@/hooks/useLang'

const ProductSizeTableBtn = ({ sizes, type, className }: ISelectedSizes) => {
  const { lang, translations } = useLang()
  const openQuickViewModal = useUnit($openQuickViewModal)

  const handleShowSizeTable = () => {
    if (!openQuickViewModal) {
      addOverflowHiddenToBody()
    }

    setSizeTableSizes({ sizes, type })
    showSizeTable()
  }

  return (
    <button className={`btn-reset ${className}`} onClick={handleShowSizeTable}>
      {translations[lang].product.size_table}
    </button>
  )
}

export default ProductSizeTableBtn
