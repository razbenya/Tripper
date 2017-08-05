import { Injectable } from '@angular/core';
import { Post, User } from '../_models/index';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class PostService {

  constructor(private http: Http) { }

  public create(post: Post){
     return this.http.post('/posts/publish', post);
  }

  public getPostMembers(post: Post){
    return this.http.post('/posts/members', post).map((response: Response) => response.json());
  }

  public getById(_id) {
    return this.http.get('/posts/'+_id);
  }

  public like(post:Post, userId:string){
    return this.http.post('/posts/like/'+post._id,userId);
  }

  public myPosts(_id,from,limit){
    return this.http.get('/posts/myPosts?_id='+_id+'&startIndex='+from+'&limit='+limit).map((response: Response) => response.json());
  }

  public feedPosts(_id,from,limit){
    return this.http.get('/posts/feedPosts?_id='+_id+'&startIndex='+from+'&limit='+limit).map((response: Response) => response.json());
  }

  public delete(_id){
    return this.http.delete('/posts/'+_id);
  }
  public getAll() {
      return this.http.get('/posts').map((response: Response) => response.json());
  }

}
