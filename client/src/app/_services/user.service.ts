import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll() {
      return this.http.get('/users').map((response: Response) => response.json());
  }

  getById(_id: string) {
      return this.http.get('/users/' + _id).map((response: Response) => response.json());
  }

  follow(current: User, user: User){
    return this.http.put('/users/follow/' + current._id, user);
  }

  unfollow(current: User, user: User){
    return this.http.put('/users/unfollow/' + current._id, user);
  }

  create(user: User) { 
      user._id = user.username;
      user.likes = 0;
      user.posts = [];
      user.followers = [];
      user.following = [];
      user.profilePic = "default.jpg";
      return this.http.post('/users/register', user);
  }

  update(user: User) {
      return this.http.put('/users/' + user.username, user);
  }

  delete(username: string) {
      return this.http.delete('/users/' + username);
  }

}
