import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../_models";
import { UserService } from "../../_services/index";
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  query;
  usersResult: User[]; 
  currentUser;

  constructor(private route: ActivatedRoute, private userService: UserService,private router: Router) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.query = params['q'];
      this.userService.search(this.query).subscribe(users => {
        this.usersResult = users;
        console.log(users);
      },
        error => {
          this.router.navigate(['']);
        }
      );
    });
    
  }

  getProfile() {
    return appConfig.apiUrl + "/uploads/" + this.currentUser.profilePic + "?token=" + this.currentUser.token;
  }

}
