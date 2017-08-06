import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../_models/index';
import { UserService, SocketService } from '../../_services/index';
import { appConfig } from '../../app.config';


@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css']
})
export class UserCardComponent implements OnInit {

  @Input() user: User;
  //user;
  connection;
  currentUser;
  loading = false;
  currentUserFollowing: string[];
  followStr = "Follow";

  constructor(private socketService: SocketService, private userService: UserService) { }

  follow(){
    this.loading = true;
    this.userService.follow(this.currentUser, this.user).subscribe(() => {
        this.loading = false;
        this.notifyServer(this.user);
    });
  }

  unfollow(){
    this.loading = true;
    this.userService.unfollow(this.currentUser, this.user).subscribe(() => {
        this.loading = false;
        this.notifyServer(this.user);
    })
  }

  notifyServer(user) {
    this.socketService.notifyServer('follow', user._id);
    this.socketService.notifyServer('follow', this.currentUser._id);
  }

  checkFollow(){
    if(this.currentUserFollowing.indexOf(this.user._id)<0){
      
      return this.currentUser._id!=this.user._id;
    }
      this.followStr = "Unfollow";
    return false;
  }

  getProfile(){
    let token = this.currentUser.token;
    return appConfig.apiUrl+"/uploads/"+this.user.profilePic+"?token="+token;
  }

  updateFollowing(){
    this.userService.getById(this.currentUser._id).subscribe(user => {
      this.currentUserFollowing = user.following;
      this.checkFollow();
    });
  }

  
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    //this.user = this.currentUser; //TO DELETE 
    this.currentUserFollowing = this.currentUser.following;
    this.updateFollowing();
    this.connection = this.socketService.observeServer(this.currentUser._id).subscribe(data => {
          this.updateFollowing();
          
    });
    this.checkFollow();
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
