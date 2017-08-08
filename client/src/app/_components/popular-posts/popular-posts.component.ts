import { Component, OnInit } from '@angular/core';
import { PostService, SocketService } from "../../_services/index";
import { Post } from "../../_models";

@Component({
  selector: 'app-popular-posts',
  templateUrl: './popular-posts.component.html',
  styleUrls: ['./popular-posts.component.css']
})
export class PopularPostsComponent implements OnInit {
  
  loading = false;
  connection;
  popularPosts: Post[]= [];
  morePosts: Post[] =[];
  isMore = false;
  limit = 2;
  deletePostObserver;

  constructor(private socketService: SocketService, private postService: PostService) { }
  
  getMore(){
    var currentIndex = this.popularPosts.length;
    this.postService.getPopular(currentIndex, this.limit).subscribe((posts) => {
      this.morePosts = posts;
      this.isMore = this.morePosts.length > 0;
    });
  }


  showMore(){
    this.popularPosts = this.popularPosts.concat(this.morePosts); 
    this.getMore();
  }

  init(){
    this.postService.getPopular(0, this.limit).subscribe((posts) => {
      this.popularPosts = posts;
      this.getMore();
    });
    
  }

  deletePost(postId) {
    let index = this.popularPosts.findIndex(ele => ele._id == postId);
    if(index >= 0)
      this.popularPosts.splice(index,1);  
  }

  ngOnInit() {
    this.init();
     this.deletePostObserver = this.socketService.observeServer('deletePost').subscribe(data => {
        this.deletePost(data['post']);
    })
  }

}
