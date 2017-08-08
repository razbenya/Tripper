import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from "../../_models";
import { UserService } from "../../_services/index"

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  query;
  usersResult: User[]; 

  constructor(private route: ActivatedRoute, private userService: UserService,private router: Router) {
    
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

}
