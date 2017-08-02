import { Injectable } from '@angular/core';
import { Post, User } from '../_models/index';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

@Injectable()
export class PostService {

  constructor(private http: Http) { }

  public create(post: Post){
     return this.http.post('/posts/publish', post);
  }

  public delete(_id){
    return this.http.delete('/posts/'+_id);
  }
  public getAll() {
      return this.http.get('/posts').map((response: Response) => response.json());
  }

}
