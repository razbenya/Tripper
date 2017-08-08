import { Component, OnInit } from '@angular/core';
import { appConfig } from '../../app.config';
import { SocketService } from '../../_services/index';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {

  user;
  //connection;

  constructor(private socketService: SocketService){
      this.user = JSON.parse(localStorage.getItem('currentUser'));

  }

  ngOnInit() {
    /*
    this.connection = this.socketService.observeServer("userState").subscribe( () => {
      this.user = JSON.parse(localStorage.getItem('currentUser'));
    })*/
  }
  newpost(){
    this.socketService.notifyServer("newPost", this.user._id);
  }

  getProfile(){
    return appConfig.apiUrl+"/uploads/"+this.user.profilePic+"?token="+this.user.token;
  }

}
