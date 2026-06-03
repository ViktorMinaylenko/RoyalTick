/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { useUnit } from 'effector-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/hooks/useLang'
// @ts-ignore
import '@tomtom-international/web-sdk-maps/dist/maps.css'
// @ts-ignore
import '@tomtom-international/web-sdk-plugin-searchbox/dist/SearchBox.css'
import { basePropsForMotion } from '@/constants/motion'
import styles from '@/styles/order/index.module.scss'
import { $chosenCourierAddressData, $chosenNovaPoshtaAddressData, $chosenPickupAddressData, $courierTab, $novaPoshtaTab, $pickupTab, $shouldShowCourierAddressData } from '@/context/order/state'
import OrderTitle from './OrderTitle'
import TabControls from './TabControls'
import { getNovaPoshtaOfficesByCityFx, setCourierTab, setMapInstance, setNovaPoshtaTab, setPickupTab, setShouldLoadNovaPoshtaData, setShouldShowCourierAddressData } from '@/context/order'
import { getGeolocationFx, setUserGeolocation } from '@/context/user'
import { $userGeolocation } from '@/context/user/state'
import { useTTMap } from '@/hooks/useTTMap'
import { addOverflowHiddenToBody, addScriptToHead } from '@/lib/utils/common'
import { IAddressBBox, IRoyalTickAddressData } from '@/types/order'
import AddressesList from './AddressesList'
import { handleResultClearing, handleResultSelection, handleResultsFound, handleSelectPickupAddress, initSearchMarker, SearchMarkersManager } from '@/lib/utils/map'
import { openMapModal, openNovaPoshtaMapModal } from '@/context/modals'
import CourierAddressInfo from './CourierAddressInfo'
import NovaPoshtaAddressesList from './NovaPoshtaAddressesList'

const OrderDelivery = () => {
    const { lang, translations } = useLang()
    const pickupTab = useUnit($pickupTab)
    const courierTab = useUnit($courierTab)
    const [shouldLoadMap, setShouldLoadMap] = useState(false)
    const userGeolocation = useUnit($userGeolocation)
    const { handleSelectAddress } = useTTMap()
    const chosenPickupAddressData = useUnit($chosenPickupAddressData)
    const chosenCourierAddressData = useUnit($chosenCourierAddressData)
    const shouldShowCourierAddressData = useUnit($shouldShowCourierAddressData)
    const mapRef = useRef<HTMLDivElement>(null!)
    const labelRef = useRef<HTMLLabelElement>(null!)
    const ttSearchBoxRef = useRef<any>(null)


    const novaPoshtaTab = useUnit($novaPoshtaTab)
    const chosenNovaPoshtaAddressData = useUnit($chosenNovaPoshtaAddressData)
    const novaPoshtaMapRef = useRef<HTMLDivElement>(null!)
    const novaPoshtaLabelRef = useRef<HTMLLabelElement>(null!)
    const novaPoshtaMapInstanceRef = useRef<any>(null)
    const novaPoshtaDebounceRef = useRef<NodeJS.Timeout | null>(null)
    const novaPoshtaSearchBoxRef = useRef<any>(null)

    const handleLoadNovaPoshtaSearchBox = async () => {
        if (!novaPoshtaLabelRef.current) return

        const old = novaPoshtaLabelRef.current.querySelector('.np-search-input')
        old?.remove()

        const maxWaitTime = 5000
        const startTime = Date.now()
        while (!window.tt && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        if (!window.tt) return

        //@ts-ignore
        const ttSearchBox = new window.tt.plugins.SearchBox(window.tt.services, {
            searchOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
                language: 'uk-UA',
            },
        })

        novaPoshtaSearchBoxRef.current = ttSearchBox

        const searchBoxHTML = ttSearchBox.getSearchBoxHTML()
        searchBoxHTML.classList.add('np-search-input')
        novaPoshtaLabelRef.current.append(searchBoxHTML)

        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultselected', async (e: any) => {
            const text = e.data.text
            setShouldLoadNovaPoshtaData(true)
            const result = await getNovaPoshtaOfficesByCityFx({ city: text.split(',')[0] })
            if (result && novaPoshtaMapRef.current) {
                setTimeout(() => handleLoadNovaPoshtaMap(result), 50)
            }
        })
    }

    const handleLoadNovaPoshtaMap = async (warehouses: IRoyalTickAddressData[]) => {
        if (!novaPoshtaMapRef.current) return

        const maxWaitTime = 5000
        const startTime = Date.now()
        while (!window.tt && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        if (!window.tt) return

        const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

        if (novaPoshtaMapInstanceRef.current) {
            document.querySelectorAll('.map-marker').forEach(m => m.remove())

            warehouses.forEach((item) => {
                const element = document.createElement('div')
                element.classList.add('map-marker')
                new ttMaps.Marker({ element })
                    .setLngLat([item.lon, item.lat])
                    .addTo(novaPoshtaMapInstanceRef.current)
            })

            if (warehouses.length > 0) {
                novaPoshtaMapInstanceRef.current.setCenter([warehouses[0].lon, warehouses[0].lat]).zoomTo(12)
            }
            return
        }

        const map = ttMaps.map({
            key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
            container: novaPoshtaMapRef.current,
            center: { lat: 50.4501, lng: 30.5234 },
            zoom: 10,
        })

        novaPoshtaMapInstanceRef.current = map

        warehouses.forEach((item) => {
            const element = document.createElement('div')
            element.classList.add('map-marker')
            new ttMaps.Marker({ element })
                .setLngLat([item.lon, item.lat])
                .addTo(map)
        })

        if (warehouses.length > 0) {
            map.setCenter([warehouses[0].lon, warehouses[0].lat]).zoomTo(12)
        }
    }

    const handleNovaPoshtaTab = () => {
        if (novaPoshtaTab) return
        setPickupTab(false)
        setCourierTab(false)
        setNovaPoshtaTab(true)
        cleanupMap()

        novaPoshtaMapInstanceRef.current = null

        const old = novaPoshtaLabelRef.current?.querySelector('.np-search-input')
        old?.remove()

        setTimeout(() => {
            handleLoadNovaPoshtaSearchBox()
            handleLoadNovaPoshtaMap([])
        }, 50)
    }

    const handlePickupTab = () => {
        if (pickupTab) {
            return
        }

        setPickupTab(true)
        setCourierTab(false)
        setNovaPoshtaTab(false)
        novaPoshtaMapInstanceRef.current = null
        cleanupMap()

        if (chosenPickupAddressData.address_line1) {
            setTimeout(() => handleLoadMap(
                chosenPickupAddressData.city,
                { lat: chosenPickupAddressData.lat as number, lng: chosenPickupAddressData.lon as number },
                true
            ), 50)
            return
        }

        if (userGeolocation?.features) {
            setTimeout(() => handleLoadMap(userGeolocation.features[0].properties.city), 50)
            return
        }

        setTimeout(() => handleLoadMap(), 50)
    }

    const cleanupMap = () => {
        const oldSearchBox = labelRef.current?.querySelector('.delivery-search-input')
        oldSearchBox?.remove()

        document.querySelectorAll('.map-marker').forEach(m => m.remove())
    }

    const handleCourierTab = () => {
        if (courierTab) {
            return
        }

        setPickupTab(false)
        setCourierTab(true)
        setNovaPoshtaTab(false)
        novaPoshtaMapInstanceRef.current = null
        cleanupMap()

        

        if (userGeolocation?.features) {
            handleLoadMap(userGeolocation?.features[0].properties.city)
            return
        }

        handleLoadMap()
    }

    const handleOpenMapModal = () => {
        openMapModal()
        addOverflowHiddenToBody()

    }

    useEffect(() => {
        getUserGeolocation()
    }, [])

    useEffect(() => {
        if (chosenPickupAddressData.address_line1 && ttSearchBoxRef.current) {
            ttSearchBoxRef.current.setValue(chosenPickupAddressData.city || '')
        }
    }, [chosenPickupAddressData])

    useEffect(() => {
        if (shouldLoadMap) {
            addScriptToHead(
                'https://api.tomtom.com/maps-sdk-for-web/cdn/6.x/6.1.2-public-preview.15/services/services-web.min.js'
            )
            addScriptToHead(
                'https://api.tomtom.com/maps-sdk-for-web/cdn/plugins/SearchBox/3.1.3-public-preview.0/SearchBox-web.js'
            )
            setTimeout(() => handleLoadMap(), 50)
        }
    }, [shouldLoadMap])

    const getUserGeolocation = () => {
        const success = async (pos: GeolocationPosition) => {
            const { latitude, longitude } = pos.coords

            const result = await getGeolocationFx({ lat: latitude, lon: longitude })

            if (!result) {
                return
            }

            setUserGeolocation(result.data)
            setShouldLoadMap(true)
        }

        const error = async (error: GeolocationPositionError) => {
            setShouldLoadMap(true)
            toast.error(`${error.code} ${error.message}`)
        }

        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        })
    }

    const handleLoadMap = async (
        initialSearchValue = '',
        initialPosition = {
            lat: 50.4501,
            lng: 30.5234,
        },
        withMarker = false
    ) => {
        if (!mapRef.current) {
            return
        }

        const maxWaitTime = 5000
        const startTime = Date.now()

        while (!window.tt && Date.now() - startTime < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (!window.tt) {
            toast.error('TomTom services failed to load')
            return
        }

        const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

        const map = ttMaps.map({
            key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
            container: mapRef.current,
            center: initialPosition,
            zoom: 10,
        })

        setMapInstance(map)
        withMarker &&
            handleSelectAddress(
                chosenPickupAddressData.bbox as IAddressBBox,
                {
                    lat: chosenPickupAddressData.lat as number,
                    lon: chosenPickupAddressData.lon as number,
                },
                map
            )

        initSearchMarker(ttMaps)

        //@ts-ignore
        const ttSearchBox = new window.tt.plugins.SearchBox(window.tt.services, {
            searchOptions: {
                key: process.env.NEXT_PUBLIC_TOMTOM_API_KEY as string,
                language: 'en',
            }
        })

        ttSearchBoxRef.current = ttSearchBox

        const searchBoxHTML = ttSearchBox.getSearchBoxHTML()
        searchBoxHTML.classList.add('delivery-search-input')
        labelRef.current.append(searchBoxHTML)

        initialSearchValue && ttSearchBox.setValue(initialSearchValue)

        //@ts-ignore
        const searchMarkersManager = new SearchMarkersManager(map, {}, ttMaps)
        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultsfound', (e) =>
            handleResultsFound(e, searchMarkersManager, map, true)
        )
        //@ts-ignore
        ttSearchBox.on('tomtom.searchbox.resultselected', (e) => {
            handleResultSelection(e, searchMarkersManager, map, true)
            setShouldShowCourierAddressData(false)
        })
        ttSearchBox.on('tomtom.searchbox.resultscleared', () =>
            handleResultClearing(searchMarkersManager, map, userGeolocation)
        )

        if (userGeolocation?.features && !withMarker) {
            ttSearchBox.setValue(userGeolocation?.features[0].properties.city)
            handleSelectPickupAddress(userGeolocation?.features[0].properties.city)

            map
                .setCenter([
                    userGeolocation?.features[0].properties.lon,
                    userGeolocation?.features[0].properties.lat,
                ])
                .zoomTo(10)
        }
    }


    return (
        <>
            <OrderTitle orderNumber='2' text={translations[lang].order.delivery} />
            <div className={styles.order__list__item__delivery}>
                <TabControls
                    handleTab1={handlePickupTab}
                    handleTab2={handleCourierTab}
                    handleTab3={handleNovaPoshtaTab}
                    tab1Active={pickupTab}
                    tab2Active={courierTab}
                    tab3Active={novaPoshtaTab}
                    tab1Text={translations[lang].order.pickup_free}
                    tab2Text={translations[lang].order.courier_delivery}
                    tab3Text='Нова Пошта'
                />
                {pickupTab && (
                    <motion.div
                        className={styles.order__list__item__delivery__pickup}
                        {...basePropsForMotion}
                    >
                        <div className={styles.order__list__item__delivery__inner}>
                            <label
                                className={styles.order__list__item__delivery__label}
                                ref={labelRef}
                            >
                                <span>{translations[lang].order.search_title}</span>
                            </label>
                            <AddressesList
                                listClassName={styles.order__list__item__delivery__list}
                            />
                        </div>
                        <div
                            className={styles.order__list__item__delivery__map}
                            ref={mapRef}
                            onClick={handleOpenMapModal}
                        />
                    </motion.div>
                )}
                {courierTab && (
                    <motion.div {...basePropsForMotion} style={{ minHeight: '100px', display: 'block' }}>
                        {!shouldShowCourierAddressData && (
                            <div className={styles.order__list__item__delivery__courier} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <span style={{ display: 'block' }}>{translations[lang].order.where_deliver_order}</span>
                                <span style={{ display: 'block' }}>{translations[lang].order.enter_address_on_map}</span>
                                <button className='btn-reset' onClick={handleOpenMapModal} style={{ display: 'block', padding: '8px 16px', marginTop: '10px' }}>
                                    {translations[lang].order.map}
                                </button>
                            </div>
                        )}
                        {shouldShowCourierAddressData &&
                            !!chosenCourierAddressData.address_line1 && (
                                // eslint-disable-next-line indent
                                <CourierAddressInfo />
                            )}
                    </motion.div>
                )}
                {novaPoshtaTab && (
                    <motion.div
                        className={styles.order__list__item__delivery__pickup}
                        {...basePropsForMotion}
                    >
                        <div className={styles.order__list__item__delivery__inner}>
                            <label
                                className={styles.order__list__item__delivery__label}
                                ref={novaPoshtaLabelRef}
                            >
                                
                                <span>{translations[lang].order.search_title}</span>
                            </label>
                            <NovaPoshtaAddressesList
                                listClassName={styles.order__list__item__delivery__list}
                                onSelectAddress={(item) => {
                                    if (novaPoshtaMapInstanceRef.current) {
                                        import(`@tomtom-international/web-sdk-maps`).then((ttMaps) => {
                                            novaPoshtaMapInstanceRef.current.setCenter([item.lon, item.lat]).zoomTo(17)
                                        })
                                    }
                                }}
                            />
                        </div>
                        <div
                            className={styles.order__list__item__delivery__map}
                            ref={novaPoshtaMapRef}
                            onClick={() => { openNovaPoshtaMapModal(); addOverflowHiddenToBody() }}
                        />
                    </motion.div>
                )}
            </div>
        </>
    )
}

export default OrderDelivery