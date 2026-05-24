export const auctionSaleTypes = ['auction', 'fixed', 'combined'] as const

export const auctionConditions = ['new', 'used', 'refurbished'] as const

export const auctionDeliveryMethods = ['nova_poshta', 'ukrposhta', 'courier', 'pickup'] as const

export const auctionPaymentMethods = ['online', 'upon_receipt', 'card', 'cash'] as const

export const profileSliderSettings = {
    dots: false,
    infinite: false,
    slidesToScroll: 1,
    variableWidth: true,
    speed: 400,
    autoplay: false,
    arrows: false,
}

export const LOTS_PER_PAGE = 12
export const AUCTION_CATEGORIES = ['watches', 'straps', 'boxes', 'care']
export const AUCTION_CONDITIONS = ['new', 'like_new', 'good', 'used', 'for_parts']
export const LOT_CREATION_FEE = 2