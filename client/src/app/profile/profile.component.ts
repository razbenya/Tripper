import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, SocketService } from "app/_services";
import { User } from "app/_models";
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


  constructor(private socketServer: SocketService, private _sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router, private userService: UserService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
  }

  getProfilePic() {
    return this._sanitizer.bypassSecurityTrustStyle(`linear-gradient( rgba(29, 29, 29, 0), rgba(16, 16, 23, 0.5)), url(${"imgs/profiles/" + this.userProfile.profilePic})`);
  }

  getUser() {
    this.userService.getById(this.id).subscribe(user => {
      this.userProfile = user;
      this.checkFollow();
    },
      error => {
        this.router.navigate(['']);
      }
    );
  }

  checkFollow() {
    this.following = "follow";
    this.userService.getById(this.currentUser._id).subscribe(user => {
      if (user.following.indexOf(this.userProfile._id) != -1)
        this.following = "Unfollow";
    });
  }

  notifyServer() {
    this.socketServer.notifyServer('follow', this.userProfile._id);
    this.socketServer.notifyServer('follow', this.currentUser._id);
  }

  follow() {
    if (this.following == "follow") {
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