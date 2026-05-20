/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useLang } from '@/hooks/useLang'
import { removeOverflowHiddenFromBody } from '@/lib/utils/common'
import { useRef, MutableRefObject, useState, useEffect } from 'react'
import styles from '@/styles/order/index.module.scss'
import {
    SearchMarkersManager,
    handleResultClearing,
    handleResultSelection,
    handleResultsFound,
    handleSelectPickupAddress,
} from '@/lib/utils/map'
import { basePropsForMotion } from '@/constants/motion'
import { motion } from 'framer-motion'
import AddressesList from './AddressesList'
import { useTTMap } from '@/hooks/useTTMap'
import {
    setChosenCourierAddressData,
    setShouldLoadRoyalTickData,
    setShouldShowCourierAddressData,
    getRoyalTickOfficesByCity,
    setCourierAddressData,
} from '@/context/order'
import { useUnit } from 'effector-react'
import {
    $chosenPickupAddressData,
    $courierAddressData,
    $mapInstance,
    $royalTickDataByCity,
    $shouldShowCourierAddressData,
} from '@/context/order/state'
import { $userGeolocation } from '@/context/user/state'
import { getGeolocationFx } from '@/context/user'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { IRoyalTickAddressData } from '@/types/order'
import { closeMapModal } from '@/context/modals'
import { mapOptions } from '@/constants/map'
import { addScriptToHead } from '@/lib/utils/common'
import { royalTickStores } from '@/constants/royaltick-stores'
import CourierAddressesItem from './CourierAddressesItem'


const MapModal = () => {
    const pickUpMapRef = useRef<HTMLDivElement>(null!)
    const courierMapRef = useRef<HTMLDivElement>(null!)
    const [ttMapInstance, setTtMapInstance] = useState<any>()
    const [pickupTab, setPickupTab] = useState(true)
    const [courierTab, setCourierTab] = useState(false)
    const pickupTabRef = useRef(true)
    const courierTabRef = useRef(false)
    const { lang, translations } = useLang()
    const shouldLoadMap = useRef(true)
    const searchMarkersManagerRef = useRef<any>(null)
    const ttSearchBoxRef = useRef<any>(null)
    const mapRef = useRef<any>(null)
    const { handleSelectAddress } = useTTMap()
    const userGeolocation = useUnit($userGeolocation)
    const royalTickDataByCity = useUnit($royalTickDataByCity)
    const mapInstance = useUnit($mapInstance)
    const chosenPickupAddressData = useUnit($chosenPickupAddressData)
    const isMedia940 = useMediaQuery(940)
    const shouldShowCourierAddressData = useUnit($shouldShowCourierAddressData)
    const courierAddressData = useUnit($courierAddressData)

    useEffect(() => {
        pickupTabRef.current = pickupTab
        courierTabRef.current = courierTab
    }, [pickupTab, courierTab])

    const removeMapMarkers = () => {
        const markers = document.querySelectorAll('.modal-map-marker')
        markers.forEach((marker) => marker.remove())
    }

    const removeSearchBox = () => {
        const searchBox = document.querySelector('.modal-search-input')
        searchBox?.remove()
    }

    const drawMarker = async (lon: number, lat: number, map: any) => {
        const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

        const element = document.createElement('div')
        element.classList.add('modal-map-marker')

        new ttMaps.Marker({ element }).setLngLat([lon, lat]).addTo(map)
    }

    const handleCloseModal = () => {
        closeMapModal()
        removeOverflowHiddenFromBody()
    }

    const handleSelectPickupTab = () => {
        if (pickupTab) {
            return
        }

        setPickupTab(true)
        setCourierTab(false)
        removeMapMarkers()
        removeSearchBox()

        if (ttSearchBoxRef.current) {
            ttSearchBoxRef.current.off('tomtom.searchbox.resultselected')
            ttSearchBoxRef.current.off('tomtom.searchbox.resultscleared')
            ttSearchBoxRef.current.off('tomtom.searchbox.resultsfound')
        }
        searchMarkersManagerRef.current = null
        ttSearchBoxRef.current = null
        mapRef.current = null

        setTimeout(() => handleLoadMap(pickUpMapRef), 50)

    }

    const handleSelectCourierTab = async () => {
        if (courierTab) {
            return
        }

        setPickupTab(false)
        setCourierTab(true)

        removeMapMarkers()
        removeSearchBox()

        if (ttSearchBoxRef.current) {
            ttSearchBoxRef.current.off('tomtom.searchbox.resultselected')
            ttSearchBoxRef.current.off('tomtom.searchbox.resultscleared')
            ttSearchBoxRef.current.off('tomtom.searchbox.resultsfound')
        }

        searchMarkersManagerRef.current = null
        ttSearchBoxRef.current = null
        mapRef.current = null
        
        setTimeout(async () => {
            const map = await handleLoadMap(courierMapRef)
            removeMapMarkers()
            if (!chosenPickupAddressData.address_line1 && courierAddressData.lat) {
                drawMarker(courierAddressData.lon, courierAddressData.lat, map)
            }
        }, 50)
    }

    //@ts-ignore
    const drawMarkerByClick = async (e) => {
        const result = await getGeolocationFx({
            lat: e.lngLat.lat,
            lon: e.lngLat.lng,
        })

        if (result) {
            removeMapMarkers()
            drawMarker(e.lngLat.lng, e.lngLat.lat, ttMapInstance)
            setCourierAddressData(result.data.features[0].properties)
            setShouldShowCourierAddressData(true)
        }
    }

    useEffect(() => {
        if (ttMapInstance?.once) {
            if (pickupTab) {
                ttMapInstance.off('click', drawMarkerByClick)
                return
            }

            ttMapInstance.on('click', drawMarkerByClick)
        }
    }, [courierTab, pickupTab, ttMapInstance])

    useEffect(() => {
        if (shouldLoadMap.current) {
            shouldLoadMap.current = false
            setShouldLoadRoyalTickData(true)
            getRoyalTickOfficesByCity({ city: 'Kyiv', lang: 'ua' })
            addScriptToHead(
                'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.1.2-public-preview.15/services/services-web.min.js'
            )
            addScriptToHead(
                'https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/3.1.3-public-preview.0/SearchBox-web.js'
            )
            handleLoadMap()
        }
    }, [])

    const handleLoadMap = async (initialContainer = pickUpMapRef) => {
        if (!initialContainer.current) {
            return
        }

        const maxWaitTime = 5000
        const startTime = Date.now()

        while (!window.tt && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!window.tt) {
            return
        }

        const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

        const map = ttMaps.map({
            key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
            container: initialContainer.current,
            center: {
                lat: 50.4501,
                lng: 30.5234,
            },
            zoom: 10,
        })

        setTtMapInstance(map)

        //@ts-ignore
        const ttSearchBox = new window.tt.plugins.SearchBox(window.tt.services, {
            searchOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
                language: 'en',
            },
            autocompleteOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
            }
        })

        const searchBoxHTML = ttSearchBox.getSearchBoxHTML()
        searchBoxHTML.classList.add('modal-search-input')
        initialContainer.current.append(searchBoxHTML)

        //@ts-ignore
        const searchMarkersManager = new SearchMarkersManager(map, {}, ttMaps)
        searchMarkersManagerRef.current = searchMarkersManager
        ttSearchBoxRef.current = ttSearchBox
        mapRef.current = map

        const nav = new ttMaps.NavigationControl({})
        map.addControl(nav, 'bottom-right')
        map.addControl(
            new ttMaps.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true,
                },
                trackUserLocation: true,
            }),
            'bottom-left'
        )

        const setMarkersByLocationsData = (data: IRoyalTickAddressData[]) => {
            data.forEach((item) => {
                const sw = new ttMaps.LngLat(item.bbox.lon1, item.bbox.lat1)
                const ne = new ttMaps.LngLat(item.bbox.lon2, item.bbox.lat2)
                const bounds = new ttMaps.LngLatBounds(sw, ne)

                map.fitBounds(bounds, { padding: 130, linear: true })

                const element = document.createElement('div')
                element.classList.add('modal-map-marker')

                new ttMaps.Marker({ element })
                    .setLngLat([item.lon, item.lat])
                    .addTo(map.zoomTo(12))
            })
        }

        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultselected', async (e) => {
            if (searchMarkersManagerRef.current && mapRef.current === map) {
                if (pickupTabRef.current) {
                    const data = await handleSelectPickupAddress(e.data.text)
                    handleResultSelection(e, searchMarkersManagerRef.current, map, true)
                    setMarkersByLocationsData(data)
                } else {
                    handleResultSelection(e, searchMarkersManagerRef.current, map, false)
                }
            }
        })

        ttSearchBox.on('tomtom.searchbox.resultscleared', () => {
            if (searchMarkersManagerRef.current && mapRef.current === map) {
                handleResultClearing(searchMarkersManagerRef.current, map, userGeolocation)
                handleResultClearing(searchMarkersManagerRef.current, mapInstance, userGeolocation)
            }
        })

        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultsfound', (e) => {
            if (searchMarkersManagerRef.current && mapRef.current === map) {
                handleResultsFound(e, searchMarkersManagerRef.current, map, pickupTabRef.current)
            }
        })

        if (!!chosenPickupAddressData.address_line1) {
            const chosenItem = royalTickStores.find(
                (item) => item.address_line2 === chosenPickupAddressData.address_line2
            )

            if (chosenItem) {
                setShouldLoadRoyalTickData(false)
                setMarkersByLocationsData([chosenItem])
                map.setCenter([chosenItem.lon, chosenItem.lat]).zoomTo(12)
                ttSearchBox.setValue(chosenItem.city)
            }

            return
        }

        if (!userGeolocation.features) {
            setMarkersByLocationsData(royalTickStores)
            ttSearchBox.setValue('Kyiv')
        } else {
            map
                .setCenter([
                    userGeolocation?.features[0].properties.lon,
                    userGeolocation?.features[0].properties.lat,
                ])
                .zoomTo(12)
            ttSearchBox.setValue(userGeolocation?.features[0].properties.city)
        }

        setMarkersByLocationsData(royalTickStores)

        return map
    }

    const handleSelectAddressByMarkers = (
        {
            lon1,
            lat1,
            lon2,
            lat2,
        }: {
            lon1: number
            lat1: number
            lon2: number
            lat2: number
        },
        position: {
            lat: number
            lon: number
        }
    ) => {
        removeMapMarkers()
        handleSelectAddress(
            {
                lon1,
                lat1,
                lon2,
                lat2,
            },
            position,
            mapInstance
        )
        setShouldShowCourierAddressData(false)
        setChosenCourierAddressData({})
        handleCloseModal()
        setPickupTab(true)
        setCourierTab(false)
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
                    {translations[lang].order.delivery_way}
                </h3>
                <div className={styles.map_modal__control__tabs}>
                    <button
                        className={`btn-reset ${pickupTab ? styles.active : ''}`}
                        onClick={handleSelectPickupTab}
                    >
                        {translations[lang].order.pickup_point}
                    </button>
                    <button
                        className={`btn-reset ${courierTab ? styles.active : ''}`}
                        onClick={handleSelectCourierTab}
                    >
                        {translations[lang].order.by_courier}
                    </button>
                </div>
                {pickupTab && (
                    <motion.div
                        {...basePropsForMotion}
                        className={styles.map_modal__control__content}
                    >
                        <AddressesList
                            listClassName={styles.map_modal__control__content__list}
                            handleSelectAddressByMarkers={handleSelectAddressByMarkers}
                        />
                    </motion.div>
                )}
                {courierTab && (
                    <motion.div
                        {...basePropsForMotion}
                        className={styles.map_modal__control__content}
                    >
                        {!shouldShowCourierAddressData && (
                            <p className={styles.map_modal__control__content__default}>
                                <b>{translations[lang].order.where_deliver_order}</b>
                                <span>
                                    {translations[lang].order.enter_address_on_map_or_search}
                                </span>
                            </p>
                        )}
                        {shouldShowCourierAddressData && <CourierAddressesItem />}
                    </motion.div>
                )}
            </div>
            {pickupTab && (
                <div className={styles.map_modal__map} ref={pickUpMapRef} />
            )}
            {courierTab && (
                <div className={styles.map_modal__map} ref={courierMapRef} />
            )}
        </div>
    )
}

export default MapModal