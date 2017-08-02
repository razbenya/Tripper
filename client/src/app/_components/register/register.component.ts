import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService, UserService } from '../../_services/index';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  model: any = {};
  loading = false;

  constructor(
    private router: Router,
    private userService: UserService,
    private alertService: AlertService
  ) { }

  register() {
    this.loading = true;
    if (this.model.password.length < 4) {
      this.alertService.error("password too short (at least 4 characters)");
      this.loading = false;
    }
    else {
      this.userService.create(this.model)
        .subscribe(
        data => {
          this.alertService.success('Registration successful', true);
          this.router.navigate(['/login']);
        },
        error => {
          this.alertService.error(error);
          this.loading = false;
        }
        );
    }
  }
}
