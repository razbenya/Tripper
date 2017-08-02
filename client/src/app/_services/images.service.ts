import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from "rxjs/Observable";
import { appConfig } from '../app.config';

@Injectable()
export class ImagesService {

  constructor(private http: Http) {}

  public deleteImage(url: string, imageName: string) : Observable<Response> {
     if (!url || url === '') {
      throw new Error('Url is not set! Please set it before doing queries');
    }
    return this.http.post(url+ "/delete/", {path: imageName});
  }

  


}
