export type IMessage = {
    pk_message: number,
    text: string,
    isprimary: boolean
}

export interface ImageProps {
    pk_image: number;
    title: string;
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
    images: ImageProps[];
}

export interface INews {
    news: NewsItem[]
}