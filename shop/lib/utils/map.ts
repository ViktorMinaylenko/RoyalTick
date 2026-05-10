/* eslint-disable indent */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import {
    getRoyalTickOfficesByCityFx,
    setChosenPickupAddressData,
    setShouldLoadRoyalTickData,
} from '@/context/order'

export const handleSelectPickupAddress = async (text: string) => {
    let langFromLS = JSON.parse(localStorage.getItem('lang') as string)
    if (!langFromLS) langFromLS = 'ua'

    setShouldLoadRoyalTickData(true)

    const royalTickData = await getRoyalTickOfficesByCityFx({
        city: text,
        lang: langFromLS,
    })

    return royalTickData
}

//@ts-ignore
export const handleResultsFound = (event, searchMarkersManager, map, isPickupTab = true) => {
    const results = event.data.results?.fuzzySearch?.results

    if (!results || results.length === 0) {
        searchMarkersManager.clear()
        return
    }

    searchMarkersManager.draw(results)
    
    // Для pickup режиму показуємо viewport, для courier не переміщаємо карту (користувач клікне на потрібний результат)
    if (isPickupTab) {
        fitToViewport(results, map)
    }
}

//@ts-ignore
export const fitToViewport = async (markerData, map) => {
    const ttMaps = await import(`@tomtom-international/web-sdk-maps`)

    if (!markerData || (markerData instanceof Array && !markerData.length)) {
        return
    }

    const bounds = new ttMaps.LngLatBounds()

    if (markerData instanceof Array) {
        markerData.forEach(function (marker) {
            //@ts-ignore
            bounds.extend(getBounds(marker))
        })
    } else {
        //@ts-ignore
        bounds.extend(getBounds(markerData))
    }

    map.fitBounds(bounds, { padding: 100, linear: true })
}

//@ts-ignore
export const getBounds = (data) => {
    let btmRight
    let topLeft

    if (data.viewport) {
        btmRight = [
            data.viewport.btmRightPoint.lng,
            data.viewport.btmRightPoint.lat,
        ]
        topLeft = [data.viewport.topLeftPoint.lng, data.viewport.topLeftPoint.lat]
    }

    return [btmRight, topLeft]
}

//@ts-ignore
export const handleResultClearing = (
    //@ts-ignore
    searchMarkersManager,
    //@ts-ignore
    map,
    //@ts-ignore
    userGeolocation
) => {
    searchMarkersManager.clear()

    if (userGeolocation?.features) {
        handleSelectPickupAddress(userGeolocation?.features[0].properties.city)

        map
            .setCenter([
                userGeolocation?.features[0].properties.lon,
                userGeolocation?.features[0].properties.lat,
            ])
            .zoomTo(10)
    } else {
        map.setCenter([30.5234, 50.4501]).zoomTo(10)
    }

    document.querySelector('.map-marker')?.remove()
    setChosenPickupAddressData({})
}

//@ts-ignore
export const handleResultSelection = async (event: any, searchMarkersManager: any, map: any, isPickupTab: boolean = true) => {
    const result = event.data.result
    const text = event.data.text

    if (result.type === 'category' || result.type === 'brand') {
        return
    }

    // У режимі pickup шукаємо Royal Tick магазини
    if (isPickupTab) {
        const royalTickData = await handleSelectPickupAddress(text)
        // Якщо знайшли магазин — переміщаємо карту туди
        if (royalTickData && royalTickData.length > 0) {
            const store = royalTickData[0]
            map.setCenter([store.lon, store.lat]).zoomTo(13)
            return
        }
    }

    // У режимі courier — показуємо точну позицію результату з максимальним zoom
    searchMarkersManager.draw([result])
    
    if (!isPickupTab) {
        // Витягаємо координати з результату
        const lng = result.position?.lng || result.position?.lon
        const lat = result.position?.lat
        
        if (lng !== undefined && lat !== undefined) {
            // Для курєрської доставки переміщаємось на точні координати з максимальним zoom
            map.setCenter([lng, lat]).zoomTo(16)
            return
        }
    }

    // Fallback: використовуємо viewport
    fitToViewport(result, map)
  }

//@ts-ignore
export function SearchMarkersManager(map, options, ttMaps) {
    //@ts-ignore
    this.map = map
    //@ts-ignore
    this._options = options || {}
    //@ts-ignore
    this._poiList = undefined
    //@ts-ignore
    this.markers = {}
    //@ts-ignore
    this.ttMaps = ttMaps
}

//@ts-ignore
SearchMarkersManager.prototype.draw = function (poiList) {
    this._poiList = poiList
    this.clear()
    //@ts-ignore
    this._poiList.forEach((poi) => {
        const markerId = poi.id
        
        const element = document.createElement('div')
        element.style.background = 'white'
        element.style.width = '10px'
        element.style.height = '10px'
        element.style.borderRadius = '50%'
        element.style.border = '3px solid black'
        
        //@ts-ignore
        const marker = new this.ttMaps.Marker({ element })
        //@ts-ignore
        marker.setLngLat([poi.position.lng, poi.position.lat])
        //@ts-ignore
        marker.addTo(this.map)
        //@ts-ignore
        this.markers[markerId] = marker
    })
}

//@ts-ignore
SearchMarkersManager.prototype.clear = function () {
    for (const markerId in this.markers) {
        const marker = this.markers[markerId]
        if (marker && marker.remove) {
            marker.remove()
        }
    }
    this.markers = {}
    this._lastClickedMarker = null
}

//@ts-ignore
export function initSearchMarker(ttMaps) {
    //@ts-ignore
    function SearchMarker(poiData, options) {
        //@ts-ignore
        this.poiData = poiData
        //@ts-ignore
        this.options = options || {}
        //@ts-ignore
        this.marker = new ttMaps.Marker({
            //@ts-ignore
            element: this.createMarker(),
            anchor: 'bottom',
        })
        //@ts-ignore
        const lon = this.poiData.position.lng || this.poiData.position.lon
        //@ts-ignore
        this.marker.setLngLat([lon, this.poiData.position.lat])
    }

    //@ts-ignore
    SearchMarker.prototype.addTo = function (map) {
        this.marker.addTo(map)
        this._map = map
        return this
    }

    SearchMarker.prototype.createMarker = function () {
        const elem = document.createElement('div')
        // elem.className = 'tt-icon-marker-black tt-search-marker'
        if (this.options.markerClassName) {
            elem.className += ' ' + this.options.markerClassName
        }
        const innerElem = document.createElement('div')
        innerElem.setAttribute(
            'style',
            'background: white; width: 10px; height: 10px; border-radius: 50%; border: 3px solid black;'
        )

        elem.appendChild(innerElem)
        return elem
    }

    SearchMarker.prototype.remove = function () {
        this.marker.remove()
        this._map = null
    }
}