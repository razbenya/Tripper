import { Component, OnInit } from '@angular/core';
import { User, Post} from '../../_models/index';
import { PostService, UserService, SocketService } from '../../_services/index';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users: User[] = [];
  posts: Post[] = [];
  token;

  navFeed = true;
  navPopular = false;
  feedClass ="nav-link active";
  popularClass="nav-link";

  constructor(private postService: PostService, private userService: UserService, private socketService: SocketService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
  }


  changeToFeed(){
      this.feedClass ="nav-link active";
      this.popularClass="nav-link";
      this.navFeed = true;
      this.navPopular = false;
  }

  changeToPopular(){
      this.feedClass ="nav-link";
      this.popularClass="nav-link active";
      this.navFeed = false;
      this.navPopular = true;
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
    this.userService.getById(this.currentUser._id).subscribe((user) => {
      this.currentUser = user;
    });
    this.loadAllUsers();
    //this.loadAllPosts();
    this.loadMyPosts();
    this.token = JSON.parse(localStorage.getItem('currentUser')).token;


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

  getProfile(){
    return appConfig.apiUrl+"/uploads/"+this.currentUser.profilePic+"?token="+this.token;
  }

}
