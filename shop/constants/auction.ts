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