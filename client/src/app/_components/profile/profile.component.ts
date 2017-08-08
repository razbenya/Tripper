import {NgZone, Component,ElementRef,  OnInit,  ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, SocketService } from "../../_services/index";
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
   @ViewChild("newpost") postlist;


  currentUser: User;
  userProfile: User;
  id: string;
  following: string;
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
  nav = "posts";

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

  newpost(){
    this.postlist.getNew();
  }
  

  constructor(private ngZone: NgZone,private socketServer: SocketService, private _sanitizer: DomSanitizer, 
    private route: ActivatedRoute, private router: Router, private userService: UserService) {
    let user = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUser = user;
    this.getUpdateCurrentUser();
    this.token = user.token;
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
    //var x = this.router.parseUrl(this.router.url).root.children;
    
    
   /* window['profile'] = {
      component: this,
      refreshProfile: () => this.getUser(), 
      zone: ngZone
    };*/
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
      this.getFollowerList();
      this.getFollowingList();
      this.checkFollow();
      this.loading = false;
    },
      error => {
        this.router.navigate(['']);
      }
    );
  }

  checkFollow() {
    this.loading = true;
    
    this.userService.getById(this.currentUser._id).subscribe(user => {
      if(user._id == this.userProfile._id)
        this.following = "Edit profile";
      else if (user.following.indexOf(this.userProfile._id) != -1)
        this.following = "Unfollow";
      else
        this.following = "follow";
       this.loading = false;
    });
  }

  notifyServer() {
    this.socketServer.notifyServer('follow', this.userProfile._id);
    this.socketServer.notifyServer('follow', this.currentUser._id);
  }

  follow() {
    this.loading = true;
   // if(window['poplist'])
     // window['poplist'].zone.run(() => { window['poplist'].refreshList() });
    if (this.following == "Edit profile"){
      this.modal.open();
      this.loading = false;
    }
    else if (this.following == "follow") {
      this.userService.follow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
        this.getUser();
      },error => {
        this.loading = false;
    });
    }
    else {
      this.userService.unfollow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
        this.getUser();
      },error => {
        this.loading = false;
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
  currentConnection;
  
  socketObserverInit() {
      this.connection = this.socketServer.observeServer(this.id).subscribe(data => {
          this.getUser();
      });
  }

  ngOnInit() {
     this.socketObserverInit();
    this.getUser();

    let x = this.router.url.substr(1);
    this.nav = x.substr(x.indexOf("/")+1);
    if(this.nav=="following"){
      this.changeToFollowing();
    }
    else if (this.nav == "followers"){
      this.changeToFollowers();
    }
   
  }

  ngOnDestroy(): void {
    if (this.connection) {
      this.connection.unsubscribe();
    }
  }
}