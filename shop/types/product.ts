export interface IProductPageProps {
    productId: string
    category: string
}

export interface IProductImagesItemProps {
    image: {
        id: string
        src: string
        alt: string
    }
    imgSize: number
    
}

export interface IProductInfoAccordionProps {
    title: string
    children: React.ReactNode
}