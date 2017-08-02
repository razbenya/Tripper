import { Component, OnInit } from '@angular/core';
import { User, Post} from '../../_models/index';
import { PostService, UserService, SocketService } from '../../_services/index';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  posts: Post[] = [];

  constructor(private postService: PostService, private userService: UserService, private socketService: SocketService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }

  

  ngOnInit() {
    this.loadAllUsers();
    this.loadAllPosts();
    this.socketService.observeServer('test2').subscribe(test => {
      this.loadAllUsers();
    })
    this.socketService.notifyServer("test1","test");


  }
  deletePost(_id){
    this.postService.delete(_id).subscribe(()=> {
      this.loadAllPosts();
    })
  }

  deleteUser(_id: string) {
      this.userService.delete(_id).subscribe(() => { 
        this.loadAllUsers() 
        this.socketService.notifyServer("test1","test");
      });
  }

  private loadAllPosts(){
    this.postService.getAll().subscribe(posts => {
      this.posts = posts;
    })
  }

  private loadAllUsers() {
      this.userService.getAll().subscribe(users => { this.users = users; });
  }

}
