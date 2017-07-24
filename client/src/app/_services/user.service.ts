import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';

import { User } from '../_models/index';

@Injectable()
export class UserService {

  constructor(private http: Http) { }

  getAll() {
      return this.http.get('/users').map((response: Response) => response.json());
  }

  getById(username: string) {
      console.log(username);
      return this.http.get('/users/' + username).map((response: Response) => response.json());
  }

  create(user: User) { 
      user._id = user.username;
      return this.http.post('/users/register', user);
  }

  update(user: User) {
      return this.http.put('/users/' + user.username, user);
  }

  delete(username: string) {
      return this.http.delete('/users/' + username);
  }

}
