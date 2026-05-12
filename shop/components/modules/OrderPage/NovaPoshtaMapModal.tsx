/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { useLang } from '@/hooks/useLang'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import { useRef, useState, useEffect } from 'react'
import styles from '@/styles/order/index.module.scss'
import { basePropsForMotion } from '@/constants/motion'
import { motion } from 'framer-motion'
import { useUnit } from 'effector-react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { IRoyalTickAddressData } from '@/types/order'
import { closeNovaPoshtaMapModal } from '@/context/modals'
import { addScriptToHead } from '@/lib/utils/common'
import { getNovaPoshtaOfficesByCityFx, setChosenNovaPoshtaAddressData, setShouldLoadNovaPoshtaData } from '@/context/order'
import { $chosenNovaPoshtaAddressData, $novaPoshtaDataByCity } from '@/context/order/state'
import { $userGeolocation } from '@/context/user/state'
import NovaPoshtaAddressesList from './NovaPoshtaAddressesList'

const NovaPoshtaMapModal = () => {
    const mapRef = useRef<HTMLDivElement>(null!)
    const searchBoxContainerRef = useRef<HTMLDivElement>(null!)
    const [mapInstance, setMapInstance] = useState<any>(null)
    const ttSearchBoxRef = useRef<any>(null)
    const mapInstanceRef = useRef<any>(null)
    const shouldLoadMap = useRef(true)
    const { lang, translations } = useLang()
    const isMedia940 = useMediaQuery(940)
    const userGeolocation = useUnit($userGeolocation)
    const chosenNovaPoshtaAddressData = useUnit($chosenNovaPoshtaAddressData)
    const novaPoshtaDataByCity = useUnit($novaPoshtaDataByCity)

    const handleCloseModal = () => {
        closeNovaPoshtaMapModal()
        removeOverflowHiddenFromBody()
    }

    const removeMapMarkers = () => {
        document.querySelectorAll('.np-modal-map-marker').forEach(m => m.remove())
    }

    const drawMarkersOnMap = (map: any, ttMaps: any, warehouses: IRoyalTickAddressData[]) => {
        removeMapMarkers()
        warehouses.forEach((item) => {
            const element = document.createElement('div')
            element.classList.add('map-marker') // ← той самий клас
            new ttMaps.Marker({ element })
                .setLngLat([item.lon, item.lat])
                .addTo(map)
        })

        if (warehouses.length > 0) {
            map.setCenter([warehouses[0].lon, warehouses[0].lat]).zoomTo(12)
        }
    }

    useEffect(() => {
        if (shouldLoadMap.current) {
            shouldLoadMap.current = false
            addScriptToHead('https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.1.2-public-preview.15/services/services-web.min.js')
            addScriptToHead('https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/3.1.3-public-preview.0/SearchBox-web.js')
            setTimeout(() => {
                if (mapRef.current) {
                    handleLoadMap()
                }
            }, 100)
        }
    }, [])

    const handleLoadMap = async () => {
        if (!mapRef.current) {
            setTimeout(() => handleLoadMap(), 100)
            return
        }

        const maxWaitTime = 5000
        const startTime = Date.now()
        while (!window.tt && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        if (!window.tt) return

        const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

        const initialCenter = userGeolocation?.features
            ? { lat: userGeolocation.features[0].properties.lat, lng: userGeolocation.features[0].properties.lon }
            : { lat: 50.4501, lng: 30.5234 }

        try {
            const map = ttMaps.map({
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
                container: mapRef.current,
                center: initialCenter,
                zoom: 10,
            })

        mapInstanceRef.current = map
        setMapInstance(map)

        map.addControl(new ttMaps.NavigationControl({}), 'bottom-right')

        // SearchBox
        //@ts-ignore
        const ttSearchBox = new window.tt.plugins.SearchBox(window.tt.services, {
            searchOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
                language: 'uk-UA',
            },
            autocompleteOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
            },
        })

        ttSearchBoxRef.current = ttSearchBox
        const searchBoxHTML = ttSearchBox.getSearchBoxHTML()
        searchBoxHTML.classList.add('np-modal-search-input')
        searchBoxContainerRef.current.append(searchBoxHTML)

        // якщо є вже вибране місто — показати його відділення
        if (novaPoshtaDataByCity.length > 0) {
            drawMarkersOnMap(map, ttMaps, novaPoshtaDataByCity)
        }

        if (chosenNovaPoshtaAddressData.city) {
            ttSearchBox.setValue(chosenNovaPoshtaAddressData.city)
        } else if (userGeolocation?.features) {
            ttSearchBox.setValue(userGeolocation.features[0].properties.city)
        }

        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultselected', async (e) => {
            const cityName = e.data.text.split(',')[0]
            setShouldLoadNovaPoshtaData(true)
            const result = await getNovaPoshtaOfficesByCityFx({ city: cityName })
            if (result) {
                drawMarkersOnMap(map, ttMaps, result)
            }
        })

        ttSearchBox.on('tomtom.searchbox.resultscleared', () => {
            removeMapMarkers()
            setShouldLoadNovaPoshtaData(false)
            if (userGeolocation?.features) {
                map.setCenter([
                    userGeolocation.features[0].properties.lon,
                    userGeolocation.features[0].properties.lat,
                ]).zoomTo(10)
            } else {
                map.setCenter([30.5234, 50.4501]).zoomTo(10)
            }
        })
        } catch (error) {
            console.error('Failed to load map:', error)
        }
    }

    const handleSelectAddress = (item: IRoyalTickAddressData) => {
        setShouldLoadNovaPoshtaData(false)
        setChosenNovaPoshtaAddressData(item)
        handleCloseModal()

        // фокусуємо карту на вибраному відділенні
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter([item.lon, item.lat]).zoomTo(17)
        }
    }

    return (
        <div className={styles.map_modal__inner}>
            <button
                className={`btn-reset ${styles.map_modal__close}`}
                onClick={handleCloseModal}
            >
                {isMedia940 ? '' : translations[lang].common.close}
            </button>
            <div className={styles.map_modal__control}>
                <h3 className={styles.map_modal__title}>
                    Оберіть відділення Нової Пошти
                </h3>
                <div ref={searchBoxContainerRef} style={{ marginBottom: '16px' }} />
                <motion.div
                    {...basePropsForMotion}
                    className={styles.map_modal__control__content}
                >
                    <NovaPoshtaAddressesList
                        listClassName={styles.map_modal__control__content__list}
                        onSelectAddress={handleSelectAddress}
                    />
                </motion.div>
            </div>
            <div className={styles.map_modal__map} ref={mapRef} />
        </div>
    )
}

export default NovaPoshtaMapModal