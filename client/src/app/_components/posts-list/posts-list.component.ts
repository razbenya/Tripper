import { Component, OnInit, Input } from '@angular/core';
import { Post, User } from "../../_models";
import { PostService, SocketService,UserService } from "../../_services/index"

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit {

  @Input() user: User;
  @Input() isFeed = true;
  numPostsToShow = 2;
  count = 1; //number of time pressed show more
  posts: Post[];
  morePosts: Post[];
  userObserver;
  isMore = false;


  constructor(private socketService: SocketService, private postService: PostService) {
  }

  getMore(){
    var currentIndex = this.posts.length;
    if(this.isFeed){
      this.postService.feedPosts(this.user._id, currentIndex, this.numPostsToShow).subscribe((posts) =>{
        this.morePosts = posts;
        this.isMore = this.morePosts.length > 0;
      });
    }
    else{
      this.postService.myPosts(this.user._id, currentIndex, this.numPostsToShow).subscribe((posts) =>{
        this.morePosts = posts;
        this.isMore = this.morePosts.length > 0;
      });
    }
    
  }

  getNew(){
    if(this.isFeed){
      this.postService.feedPosts(this.user._id, 0, this.posts.length+1).subscribe((posts) =>{
        this.posts.unshift(posts[0]);
      });
    }
    else{
      this.postService.myPosts(this.user._id, 0, this.posts.length+1).subscribe((posts) =>{
        this.posts.unshift(posts[0]);
      });
    }
  }

  deletePost(postId) {
    let index = this.posts.findIndex(ele => ele._id == postId);
    if(index >= 0)
      this.posts.splice(index,1);  
  }

  showMore(){
    this.posts = this.posts.concat(this.morePosts); 
    this.getMore();
  }


  init(){
     if(this.isFeed){
      this.postService.feedPosts(this.user._id, 0, this.numPostsToShow).subscribe((posts) =>{
        this.posts = posts;
        this.getMore();
      });
    }
    else{
      this.postService.myPosts(this.user._id, 0, this.numPostsToShow).subscribe((posts) =>{
        this.posts = posts;
        this.getMore();
      });
    }
    
  }
  deletePostObserver;
  ngOnInit() {
    this.init();
    this.userObserver = this.socketService.observeServer(this.user._id).subscribe(data => {
      if(data['type'] == 'newPost'){
        this.getNew();
      } else {
         this.getMore();
      }
    });

    this.deletePostObserver = this.socketService.observeServer('deletePost').subscribe(data => {
        this.deletePost(data['post']);
    })


  }

}
