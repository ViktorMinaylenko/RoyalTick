import { RefObject } from "react"
import { IChat } from "./lots"

export interface IAuctionFiltersProps {
    sort: string
    setSort: (s: string) => void
    category: string
    setCategory: (c: string) => void
    condition: string
    setCondition: (c: string) => void
    minPrice: string
    setMinPrice: (p: string) => void
    maxPrice: string
    setMaxPrice: (p: string) => void
    filtersOpen: boolean
    setFiltersOpen: (o: boolean) => void
    hasActiveFilters: boolean
    totalCount: number
    onReset: () => void
}

export interface IChatMessagesProps {
    chat: IChat
    userId: string
    messagesEndRef: RefObject<HTMLDivElement | null>
}

export interface IChatDealBlockProps {
    chat: IChat
    isOwner: boolean
    completeSpinner: boolean
    ratingSpinner: boolean
    selectedRating: number
    ratingComment: string
    onSetRating: (r: number) => void
    onSetComment: (c: string) => void
    onComplete: () => void
    onRate: (skip?: boolean) => void
}

export interface IProps {
    spinner: boolean
    onClose: () => void
    onConfirm: () => void
}

export interface IPropsChatListItem {
    chat: IChat
    userId: string
    onDeleteClick: (id: string, title: string) => void
}

export interface IPropsDeleteChat {
    title: string
    deletingId: string | null
    chatId: string
    onClose: () => void
    onConfirm: () => void
}
export interface ITagsInputProps {
    tags: string[]
    tagInput: string
    placeholder: string
    onTagInputChange: (val: string) => void
    onAddTag: (e: React.KeyboardEvent<HTMLInputElement>) => void
    onRemoveTag: (tag: string) => void
    inputClassName: string
    tagClassName: string
    tagsWrapperClassName: string
}

export interface IPhotoUploadGridProps {
    count?: number
    previews: (string | null)[]
    onChange: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
    thumbClassName: string
    thumbIconClassName: string
    wrapperClassName: string
}

export interface IBuyNowModalProps {
    show: boolean
    buyNowPrice: number
    confirmed: boolean
    spinner: boolean
    onClose: () => void
    onConfirmChange: (val: boolean) => void
    onConfirm: () => void
}

export interface ILotCommentsProps {
    comments: any[]
    commentText: string
    commentSpinner: boolean
    userId: string
    onTextChange: (val: string) => void
    onSubmit: () => void
}

export interface ILotSellerLotsProps {
    lots: any[]
    sellerName: string
}

export interface ILotGalleryProps {
    images: string[]
    activeImg: string
    lotTitle: string
    onThumbClick: (img: string) => void
}

export interface IPropsModeratorItem {
    chat: any
    joiningId: string | null
    onJoin: (chatId: string) => void
}

export interface IPropsModeratorChatItem {
    chat: any
    onDeleteClick: (id: string, title: string) => void
}

export interface IPropsDeleteChatModal {
    title: string
    chatId: string
    deletingId: string | null
    onClose: () => void
    onConfirm: () => void
}