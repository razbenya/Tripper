import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dummy-profile',
  templateUrl: './dummy-profile.component.html',
  styleUrls: ['./dummy-profile.component.css']
})
export class DummyProfileComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.router.navigate(['/',id]);
    });
  }
}
