
export class Post {
    _id: any;
    userId: string;
    likes: string[];
    comments: Comment[];
    taggedUsers: string[];
    title: string;
    location: {
        lat: number,
        lng: number
    }
    data: any[];
    likesNum: number;
}

export class ImgData {
    index: number;
    imgsUrl: string[];
}

export class TextData {
    index: number;
    text: string;
}

export class Comment {
    userId: string;
    text: string;
    date: Date;
}
