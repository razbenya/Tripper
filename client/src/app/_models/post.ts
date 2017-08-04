import { Comments } from "./index";

export class Post {
    _id: any;
    userId: string;
    likes: string[];
    comments: Comments[];
    taggedUsers: string[];
    title: string;
    location: {
        lat: number,
        lng: number
    }
    data: any[];
}

export class ImgData {
    index: number;
    imgsUrl: string[];
}

export class TextData {
    index: number;
    text: string;
}