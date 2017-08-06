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
    current.following.push(user._id);
    localStorage.setItem('currentUser', JSON.stringify(current));
    return this.http.put('/users/follow/' + current._id, user);
  }

  unfollow(current: User, user: User){
    current.following.splice(current.following.indexOf(user._id));
    localStorage.setItem('currentUser', JSON.stringify(current));
    return this.http.put('/users/unfollow/' + current._id, user);
  }

  create(user: User) { 
      user._id = user.username;
      user.followersNum = 0;
      user.posts = [];
      user.followers = [];
      user.following = [];
      user.taggedPosts = [];
      user.profilePic = "default.jpg";
      return this.http.post('/users/register', user);
  }

  getByRef(ref) {
      return this.http.post('/users/',ref);
  }

  update(update,_id) {
      return this.http.put('/users/' + _id, update);
  }

  delete(username: string) {
      return this.http.delete('/users/' + username);
  }

  getUsers(usersIds: string[]){
      return this.http.post('/users/getUsers', usersIds).map((response: Response) => response.json());
  }

  getPopular(user: User, limit: number){
      return this.http.post('/users/getPopularUsers?limit='+limit, user)
      .map((response: Response) => response.json());
  }

}
