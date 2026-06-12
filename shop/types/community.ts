export interface ITopicMessage {
    _id: string
    userId: string
    userName: string
    userImage: string
    text: string
    replyToId: string | null
    replyToUserName: string | null
    createdAt: string
}

export interface ITopic {
    _id: string
    title: string
    body: string
    category: string
    tags: string[]
    userId: string
    userName: string
    userImage: string
    createdAt: string
    views: number
    likes: string[]
    messages: ITopicMessage[]
    messagesCount: number
}

export type DeleteTarget = {
    type: 'topic' | 'message'
    topicId: string
    msgId?: string
    topicTitle?: string
}

export interface IDeleteTopicProps {
    topic: ITopic
    onDeleted?: (topicId: string) => void
}

export interface IPropsTopicHeader {
    topic: ITopic
    userId?: string
    lang: string
    t: any
    formatDate: (dateStr: string) => string
}

export interface IPropsTopicStats {
    topic: ITopic
    isLiked: boolean
    likesCount: number
    likeSpinner: boolean
    onLike: () => void
}

export interface IPropsTopicMessage {
    msg: ITopicMessage
    replies: ITopicMessage[]
    topicId: string
    topicTitle: string
    topicUserId: string
    userId?: string
    isModerator: boolean
    t: any
    formatDate: (dateStr: string) => string
    onReply: (msgId: string, userName: string) => void
    onDelete: (data: { type: 'topic' | 'message'; topicId: string; msgId: string; topicTitle: string }) => void
}

export interface IPropsReplyForm {
    t: any
    text: string
    sendSpinner: boolean
    replyTo: { id: string; userName: string } | null
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    onTextChange: (val: string) => void
    onSend: () => void
    onCancelReply: () => void
}
