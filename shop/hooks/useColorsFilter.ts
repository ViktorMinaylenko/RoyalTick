import { useEffect } from 'react'
import { useUnit } from 'effector-react'
import {
    $colors,
    $colorsOptions,
    setColors,
    setColorsOptions,
    updateColorsOptionByCode,
} from '@/context/catalog'
import { useLang } from './useLang'
import { getCheckedArrayParam, getSearchParamsUrl } from '@/lib/utils/common'

export const useColorsFilter = (
    handleApplyFiltersWithColors: (arg0: string[]) => void,
    pageName: string
) => {
    const { lang, translations } = useLang()
    const colorsOptions = useUnit($colorsOptions)
    const colors = useUnit($colors)

    const handleSelectColor = (id: number) => {
        const updatedOptions = colorsOptions.map((item) =>
            item.id === id ? { ...item, checked: !item.checked } : item
        )

        setColorsOptions(updatedOptions)

        const currentOption = updatedOptions.find((item) => item.id === id)

        if (currentOption && currentOption.checked) {
            setColors([...colors, currentOption.colorText])
            handleApplyFiltersWithColors(
                updatedOptions
                    .filter((option) => option.checked)
                    .map((option) => option.colorCode)
            )
            return
        }

        const updatedColorsByText = colors.filter(
            (color) => color !== currentOption?.colorText
        )

        const updatedColorsByCode = updatedColorsByText.map(
            (color) =>
                colorsOptions.find((option) => option.colorText === color)?.colorCode
        )

        setColors(updatedColorsByText)
        handleApplyFiltersWithColors(updatedColorsByCode as string[])
    }

    useEffect(() => {
        if (!translations[lang]) return

        const getRawColorsByPage = () => {
            switch (pageName) {
                case 'watches':
                    return ['white', 'black', 'green', 'blue', 'silver']
                case 'boxes':
                    return ['black', 'dark brown', 'navy', 'carbon', 'cherry']
                case 'straps': // Додано для повної підтримки маркетплейсу
                    return ['white', 'black', 'green', 'navy', 'brown', 'bordeaux', 'grey', 'beige']
                case 'catalog': // Для загальної сторінки каталогу
                    return [
                        'white', 'black', 'green', 'blue', 'silver',
                        'dark brown', 'navy', 'carbon', 'cherry',
                        'brown', 'bordeaux', 'grey', 'beige'
                    ]
                case 'care':
                    return [
                        'green',
                        'brown',
                        'black',
                        'white',
                        'navy',
                        'grey',
                        'beige',
                        'bordeaux'
                    ]
                default:
                    return []
            }
        }

        const rawColors = getRawColorsByPage()
        const urlParams = getSearchParamsUrl()
        const colorsParam = urlParams.get('colors')

        const rawParam = colorsParam ? getCheckedArrayParam(colorsParam) : []
        const validColorsFromUrl = Array.isArray(rawParam) ? (rawParam as string[]) : []

        const updatedOptions = rawColors.map((colorCode, index) => {
            const isChecked = validColorsFromUrl.includes(colorCode)

            return {
                id: index + 1,
                colorCode: colorCode,
                checked: isChecked,
                colorText: (translations[lang].catalog as any)[colorCode.toLowerCase()] || colorCode
            }
        })

        setColorsOptions(updatedOptions)

        const activeColorTexts = updatedOptions
            .filter((option) => option.checked)
            .map((option) => option.colorText)

        setColors(activeColorTexts)

        if (validColorsFromUrl.length > 0) {
            handleApplyFiltersWithColors(validColorsFromUrl)
        }

    }, [lang, pageName, translations])

    return { handleSelectColor, colors, colorsOptions }
}