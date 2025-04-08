export type IMessage = {
    pk_message: number,
    text: string,
    isprimary: boolean
}

export interface NewsItem {
    pk_news: number;
    title: string;
    small_text: string;
    images: string[];
}

export interface Columns {
    available: NewsItem[];
    displayed: NewsItem[];
}

export type IData = {
    pk_client: number
    name: string
    token: string
    floor: number
    building: string
}