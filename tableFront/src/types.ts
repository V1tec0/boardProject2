export type IMessage = {
    pk_message: number,
    text: string,
    isprimary: boolean
}


export type IData = {
    pk_client: number
    name: string
    token: string
    floor: number
    building: string
}

export interface NewsItem {
    title: string;
    small_text: string;
    main_text: string;
    image: string;
}

export interface INews {
    news: NewsItem[]
}