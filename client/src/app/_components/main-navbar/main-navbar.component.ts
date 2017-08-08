import { Component, OnInit } from '@angular/core';
import { appConfig } from '../../app.config';
import { UserService,AlertService } from '../../_services/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-navbar',
  templateUrl: './main-navbar.component.html',
  styleUrls: ['./main-navbar.component.css']
})
export class MainNavbarComponent implements OnInit {

  user;
  query;
  //connection;

  constructor(private router: Router,private userService: UserService, private alertService: AlertService){
      this.user = JSON.parse(localStorage.getItem('currentUser'));


  }

  ngOnInit() {
    /*
    this.connection = this.socketService.observeServer("userState").subscribe( () => {
      this.user = JSON.parse(localStorage.getItem('currentUser'));
    })*/
  }

  getProfile(){
    return appConfig.apiUrl+"/uploads/"+this.user.profilePic+"?token="+this.user.token;
  }

  /*
  search(){
    this.router.navigate(['search?query='+this.query]);
    
  }*/
}
