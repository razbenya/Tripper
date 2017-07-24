import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService } from "app/_services";
import { User } from "app/_models";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User;
  userProfile: User;
  id: string;


  constructor(private route: ActivatedRoute, private router: Router, private userService: UserService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.route.params.subscribe(params => {
      this.id = params['id'];
    });
  }

  getUser() {
    this.userService.getById(this.id).subscribe(user => {
      this.userProfile = user;
       console.log(this.userProfile._id);
    });
  }

  ngOnInit() {
    this.getUser();
  }

}
