import { Component, OnInit } from '@angular/core';
import { User } from '../_models/index';
import { UserService, SocketService } from '../_services/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  

  constructor(private userService: UserService, private socketService: SocketService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  

  ngOnInit() {
    this.loadAllUsers();
    this.socketService.observeServer('test2').subscribe(test => {
      this.loadAllUsers();
    })
    this.socketService.notifyServer("test1","test");


  }

  deleteUser(_id: string) {
      this.userService.delete(_id).subscribe(() => { 
        this.loadAllUsers() 
        this.socketService.notifyServer("test1","test");
      });
  }

  private loadAllUsers() {
      this.userService.getAll().subscribe(users => { this.users = users; });
  }

}
