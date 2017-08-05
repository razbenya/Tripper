import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, SocketService } from "../../_services/index"
import { User } from "../../_models";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {

  currentUser: User;
  userProfile: User;
  id: string;
  following: string = "follow";
  profilePicture: string;
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
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
  }

  getProfilePic() {
    let cu:any = this.currentUser; 
    return this._sanitizer.bypassSecurityTrustStyle(`linear-gradient( rgba(29, 29, 29, 0), rgba(16, 16, 23, 0.5)), url(${"http://localhost:4000/uploads/profiles/" + this.userProfile.profilePic +"?token="+cu.token})`);
  }

  getUser() {
    this.userService.getById(this.id).subscribe(user => {
      this.userProfile = user;
      this.checkFollow();
      this.getFollowerList();
      this.getFollowingList();
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
      //@TODO add functionality
    }
    else if (this.following == "follow") {
      this.userService.follow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
        this.loading = false;
      });
    }
    else {
      this.userService.unfollow(this.currentUser, this.userProfile).subscribe(() => {
        this.notifyServer();
        this.loading = false;
      });
    }
  }

  getFollowingList(){
    this.userService.getUsers(this.userProfile.following).subscribe((users) => {
      this.profileFollowing = users; 
      console.log(this.profileFollowing);
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