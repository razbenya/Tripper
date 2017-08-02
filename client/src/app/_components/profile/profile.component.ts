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
    if (this.following == "follow") {
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