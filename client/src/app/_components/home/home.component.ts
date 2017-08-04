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

  submit() {
    window['post-form'].zone.run(() => {window['post-form'].submit();});
    this.loadMyPosts();
  }

 
  checkValid() {
    let invalid;
    window['post-form'].zone.run(() => { invalid = window['post-form'].valid() });
    return invalid;
  }


  ngOnInit() {
    this.loadAllUsers();
    //this.loadAllPosts();
    this.loadMyPosts();
    this.socketService.observeServer('test2').subscribe(test => {
      this.loadAllUsers();
    })
    this.socketService.notifyServer("test1","test");


  }
  deletePost(_id){
    this.postService.delete(_id).subscribe(()=> {
      this.loadMyPosts();
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

  private loadMyPosts(){
    this.postService.feedPosts(this.currentUser._id,0,30).subscribe(posts => {
      this.posts = posts;
    })
  }

  private loadAllUsers() {
      this.userService.getAll().subscribe(users => { this.users = users; });
  }

}
