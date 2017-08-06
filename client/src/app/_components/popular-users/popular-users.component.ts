import { Component, OnInit } from '@angular/core';
import { UserService, SocketService } from '../../_services/index';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-popular-users',
  templateUrl: './popular-users.component.html',
  styleUrls: ['./popular-users.component.css']
})
export class PopularUsersComponent implements OnInit {

  currentUser;
  loading = false;
  connection;
  currentUserFollowing;
  followStr = "Follow";
  popularUsers; 
  limit = 3;

  constructor(private socketService: SocketService, private userService: UserService) { }

  follow(user){
    this.loading = true;
    this.userService.follow(this.currentUser, user).subscribe(() => {
        this.loading = false;
        this.notifyServer(user);
    });
  }

  unfollow(user){
    this.loading = true;
    this.userService.unfollow(this.currentUser, user).subscribe(() => {
        this.loading = false;
        this.notifyServer(user);
    })
  }

  notifyServer(user) {
    this.socketService.notifyServer('follow', user._id);
    this.socketService.notifyServer('follow', this.currentUser._id);
  }

  checkFollow(user){
    if(this.currentUserFollowing.indexOf(user._id)<0){
      
      return this.currentUser._id!=user._id;
    }
      this.followStr = "Unfollow";
    return false;
  }

  getProfile(user){
    let token = this.currentUser.token;
    return appConfig.apiUrl+"/uploads/"+user.profilePic+"?token="+token;
  }

  updateFollowing(){
    this.userService.getById(this.currentUser._id).subscribe(user => {
      this.currentUserFollowing = user.following;
    });
  }

  getPopularList(){
    this.userService.getPopular(this.currentUser, this.limit).subscribe((users) => {
      this.popularUsers = users; 
      console.log(this.popularUsers);
    })
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserFollowing = this.currentUser.following;
    this.connection = this.socketService.observeServer(this.currentUser._id).subscribe(data => {
          this.updateFollowing();
    });
    this.getPopularList();
  }

   ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
