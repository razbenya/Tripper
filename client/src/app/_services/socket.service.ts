import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';
import { appConfig } from "../app.config";
import { RequestOptionsArgs, RequestOptions, Headers } from "@angular/http";


@Injectable()
export class SocketService {
  private socket;

  notifyServer(key,value){
    this.socket.emit(key, value);
  }

  observeServer(key) {
    let observable = new Observable(observer => {
        this.socket = io.connect(appConfig.apiUrl);
        this.socket.on(key, (data) => {
          observer.next(data);
        });
        return () => {
          this.socket.disconnect();
        };
    })
    return observable;
  }
  constructor() {}
}
