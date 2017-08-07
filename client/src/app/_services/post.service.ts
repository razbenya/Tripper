import { Injectable } from '@angular/core';
import { Post, User, Comment } from '../_models/index';
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

  public update(newpost,_id) {
    return this.http.put('/posts/update/'+_id, newpost);
  }

  public getById(_id) {
    return this.http.get('/posts/'+_id).map((response: Response) => response.json());;
  }

  public like(post:Post, user:User){ 
    return this.http.post('/posts/like/'+post._id, user);
  }

  public writeComment(post:Post, comment:Comment){
    return this.http.post('/posts/comment/'+post._id, comment);
  }

  public unlike(post:Post, userId:string){
    return this.http.post('/posts/unlike/'+post._id, userId);
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

  public getPopular(startIndex:number, limit: number){
      return this.http.get('/posts/getPopularPosts?startIndex='+startIndex+'&limit='+limit)
      .map((response: Response) => response.json());
  }

}
