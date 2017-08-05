import { Component, OnInit, Input } from '@angular/core';
import { Post, User } from "../../_models";
import { PostService, SocketService } from "../../_services/index"

@Component({
  selector: 'app-posts-list',
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit {

  @Input() user: User;
  @Input() isFeed = true;
  numPostsToShow = 2;
  count = 0; //number of time pressed show more
  posts: Post[];


  constructor(private socketService: SocketService, private postService: PostService) {
  }

  showMore(){
    this.count++;
    var currentIndex = this.numPostsToShow * this.count;
    if(this.isFeed){
      this.postService.feedPosts(this.user._id, currentIndex, this.numPostsToShow).subscribe((posts) =>{
        this.posts = this.posts.concat(posts);
      });
    }
    else{
      this.postService.myPosts(this.user._id, currentIndex, this.numPostsToShow).subscribe((posts) =>{
        this.posts = this.posts.concat(posts);
      });
    }
    
  }

  ngOnInit() {
    if(this.isFeed){
      this.postService.feedPosts(this.user._id, this.count, this.numPostsToShow).subscribe((posts) =>{
        this.posts = posts;
      });
    }
    else{
      this.postService.myPosts(this.user._id, this.count, this.numPostsToShow).subscribe((posts) =>{
        this.posts = posts;
      });
    }
  }

}
