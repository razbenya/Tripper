import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { User } from '../../_models/index';
import { appConfig } from '../../app.config';
import { UserService, SocketService } from '../../_services/index'
@Component({
  selector: 'app-userlist',
  templateUrl: './userlist.component.html',
  styleUrls: ['./userlist.component.css']
})
export class UserlistComponent {

   @Input() modal;
   @Input() taggedList: User[];
   currentUser;
   loading = false;
   currentUserFollowing: string[];

  constructor(private socketService: SocketService, private userService: UserService) {}


  follow(user){
    this.loading = true;
    this.userService.follow(this.currentUser, user).subscribe(() => {
        this.loading = false;
        this.notifyServer(user);
    });
  }

  notifyServer(user) {
    this.socketService.notifyServer('follow', user._id);
    this.socketService.notifyServer('follow', this.currentUser._id);
  }

  showFollow(user){
    if(this.currentUserFollowing.indexOf(user._id)<0)
      return this.currentUser._id!=user._id;
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

  connection;
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserFollowing = this.currentUser.following;
    this.updateFollowing();
    this.connection = this.socketService.observeServer(this.currentUser._id).subscribe(data => {
          this.updateFollowing();
    });
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }

}
