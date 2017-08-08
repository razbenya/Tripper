import { Component, OnInit } from '@angular/core';
import { User, Post} from '../../_models/index';
import { PostService, UserService, SocketService } from '../../_services/index';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  token;
  navFeed = true;
  navPopular = false;
  feedClass ="nav-link active";
  popularClass="nav-link";
  connection;

  constructor(private postService: PostService, private userService: UserService, private socketService: SocketService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }


  changeToFeed(){
      this.feedClass ="nav-link active";
      this.popularClass="nav-link";
      this.navFeed = true;
      this.navPopular = false;
  }

  changeToPopular(){
      this.feedClass ="nav-link";
      this.popularClass="nav-link active";
      this.navFeed = false;
      this.navPopular = true;
  }
 


  ngOnInit() {
    this.userService.getById(this.currentUser._id).subscribe((user) => {
      this.currentUser = user;
    });


    this.token = JSON.parse(localStorage.getItem('currentUser')).token;
  }


  getProfile(){
    return appConfig.apiUrl+"/uploads/"+this.currentUser.profilePic+"?token="+this.token;
  }

}
