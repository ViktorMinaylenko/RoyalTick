'use client'
import { useUnit } from 'effector-react'
import { showSizeTable } from '@/context/modals/index'
import { $openQuickViewModal } from '@/context/modals/state'
import { addOverflowHiddenToBody } from '@/lib/utils/common'
import { ISelectedSizes } from '@/types/common'
import { setSizeTableSizes } from '@/context/sizeTable/index'
import { useLang } from '@/hooks/useLang'
import { setIsAddToFavorites } from '@/context/favorites/index'

const ProductSizeTableBtn = ({ sizes, type, className }: ISelectedSizes) => {
  const { lang, translations } = useLang()
  const openQuickViewModal = useUnit($openQuickViewModal)

  const handleShowSizeTable = () => {
    setIsAddToFavorites(false)
    
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
