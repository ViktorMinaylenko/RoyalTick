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