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
  popularPosts: Post[];
  limit = 2;
  count = 0; //number of time pressed show more

  constructor(private socketService: SocketService, private postService: PostService) { }
  
  showMore(){
    this.count++;
    var currentIndex = this.limit * this.count;
    this.postService.getPopular(currentIndex, this.limit).subscribe((posts) => {
      this.popularPosts = this.popularPosts.concat(posts);
    });
  }

  init(){
    this.postService.getPopular(this.count, this.limit).subscribe((posts) => {
      this.popularPosts = posts;
    });
    console.log(this.popularPosts); 
  }

  ngOnInit() {
    this.init();
  }

}
