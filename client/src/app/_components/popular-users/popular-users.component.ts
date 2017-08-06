import { NgZone, Component, OnInit } from '@angular/core';
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

  constructor(private ngZone: NgZone, private socketService: SocketService, private userService: UserService) {

    window["poplist"] = {
      component: this,
      refreshList: () => this.updateFollowing(),
      zone: ngZone
    };
  }

  follow(user) {
    this.loading = true;
    this.userService.follow(this.currentUser, user).subscribe(() => {
      this.notifyServer(user);
      this.updateFollowing();
      window['profile'].zone.run(() => { window['profile'].refreshProfile(); });
    });
  }

  unfollow(user) {
    this.loading = true;
    this.userService.unfollow(this.currentUser, user).subscribe(() => {
      this.notifyServer(user);
      this.updateFollowing();
      window['profile'].zone.run(() => { window['profile'].refreshProfile(); });
    })
  }

  notifyServer(user) {
    this.socketService.notifyServer('follow', user._id);
    this.socketService.notifyServer('follow', this.currentUser._id);
  }

  checkFollow(user) {
    if (this.currentUser.following.indexOf(user._id) < 0) {
      return this.currentUser._id != user._id;
    }
    return false;
  }

  getProfile(user) {
    let token = this.currentUser.token;
    return appConfig.apiUrl + "/uploads/" + user.profilePic + "?token=" + token;
  }

  updateFollowing() {
    this.userService.getById(this.currentUser._id).subscribe(user => {
      let newCurrentUser = user;
      newCurrentUser.token = this.currentUser.token;
      this.currentUser = newCurrentUser;
      this.getPopularList();
      this.loading = false;
    });
  }

  getPopularList() {
    this.userService.getPopular(this.currentUser, this.limit).subscribe((users) => {
      this.popularUsers = users;
    })
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.updateFollowing();
    this.connection = this.socketService.observeServer(this.currentUser._id).subscribe(data => {
      this.updateFollowing();
    });
    this.getPopularList();
  }

  ngOnDestroy() {
    this.connection.unsubscribe();
  }
}
