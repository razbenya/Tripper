import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from "app/_services";
import { User } from "app/_models";
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User;
  userProfile: User;
  id: string;
  following: boolean;
  profilePicture: string;


  constructor(private _sanitizer: DomSanitizer, private route: ActivatedRoute, private router: Router, private userService: UserService) {
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
    this.following = false;
    this.userService.getById(this.currentUser._id).subscribe(user => {
      user.following.forEach(element => {
        if (element == this.userProfile._id) {
          this.following = true;
        }
      });
    });
  }

  unfollow() {
    this.userService.unfollow(this.currentUser, this.userProfile).subscribe(() => {
      this.getUser();
    });
  }

  follow() {
    this.userService.follow(this.currentUser, this.userProfile).subscribe(() => {
      this.getUser();
    });
  }

  ngOnInit() {
    this.getUser();
  }
}
