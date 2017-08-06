export class User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    image: string;
    posts: number[];
    following: string[];
    followers: string[];
    taggedPosts: any[];
    profilePic: string;
    followersNum: number; 
}
