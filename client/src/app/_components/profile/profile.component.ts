import { Component,ElementRef,  OnInit,  ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, SocketService } from "../../_services/index"
import { User } from "../../_models";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  
   @ViewChild("modal") modal;
  currentUser: User;
  userProfile: User;
  id: string;
  following: string = "follow";
  //profilePicture: string;
  connection;
  loading = false;
  profileFollowing: User[];
  profileFollowers: User[];
  navFollowing = false;
  navFollowers = false;
  navPosts = true;
  postClass ="active";
  followingClass="a";
  followersClass="a";
  token;

  changeToFollowing(){
      this.postClass ="a";
      this.followingClass="active";
      this.followersClass="a";
      this.navFollowing = true;
      this.navFollowers=false;
      this.navPosts=false;
  }
  
  changeToFollowers(){
      this.postClass ="a";
      this.followingClass="a";
      this.followersClass="active";
      this.navFollowers = true;
      this.navPosts=false;
      this.navFollowing = false;
  }
  changeToPosts(){
      this.postClass ="active";
      this.followingClass="a";
      this.followersClass="a";
      this.navFollowers = false;
      this.navPosts=true;
      this.navFollowing = false;
  }
  

  constructor(private socketServer: SocketService, private _sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router, private userService: UserService) {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = user;
    this.getUpdateCurrentUser();
    this.token = user.token;
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
  }

  getUpdateCurrentUser(){
    this.userService.getById(this.currentUser._id).subscribe((user) => {
      let newCurrentUser = user;
      newCurrentUser.token = JSON.parse(localStorage.getItem('currentUser')).token;
      this.currentUser = newCurrentUser;
    });
  }


  getProfile(){
    return appConfig.apiUrl+"/uploads/"+this.userProfile.profilePic+"?token="+this.token;
  }

  getUser() {
    this.userService.getById(this.id).subscribe(user => {
      this.userProfile = user;
       this.getUpdateCurrentUser();
      this.checkFollow();
      this.getFollowerList();
      this.getFollowingList();
      this.loading = false;
    },
      error => {
        this.router.navigate(['']);
      }
    );
  }

  checkFollow() {
    this.loading = true;
    this.following = "follow";
    this.userService.getById(this.currentUser._id).subscribe(user => {
      this.loading = false;
      if(user._id == this.userProfile._id)
        this.following = "Edit profile";
      if (user.following.indexOf(this.userProfile._id) != -1)
        this.following = "Unfollow";
    });
  }

  notifyServer() {
    this.socketServer.notifyServer('follow', this.userProfile._id);
    this.socketServer.notifyServer('follow', this.currentUser._id);
  }

  follow() {
    this.loading = true;
    if (this.following == "Edit profile"){
      this.modal.open();
      this.loading = false;
    }
    else if (this.following == "follow") {
      this.userService.follow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
      });
    }
    else {
      this.userService.unfollow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
      });
    }
  }

 getFollowingList(){
    this.userService.getUsers(this.userProfile.following).subscribe((users) => {
      this.profileFollowing = users; 
    })
  }
  getFollowerList(){
    this.userService.getUsers(this.userProfile.followers).subscribe((users) => {
      this.profileFollowers = users; 
    })
  }

  socketObserverInit() {
      this.connection = this.socketServer.observeServer(this.id).subscribe(data => {
          this.getUser();
      });
  }

  ngOnInit() {
    this.getUser();
    this.socketObserverInit();
  }

  ngOnDestroy(): void {
    if (this.connection) {
      this.connection.unsubscribe();
    }
  }
}