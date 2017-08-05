import { Component, OnInit, Input } from '@angular/core';
import { User, Post, ImgData, TextData, Comment } from '../../_models/index';
import { UserService } from '../../_services/index'
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

   @Input()  comment: Comment;
  constructor(private userService: UserService) { }
  user: User;

  profilepic:string;
  getCommentpProfile(){
    let userId = this.comment.userId;
    let token = JSON.parse(localStorage.getItem('currentUser')).token;
    this.userService.getById(userId).subscribe((user) => {
      this.user = user;
      this.profilepic = appConfig.apiUrl+"/uploads/"+user.profilePic+"?token="+token;
    });
  } 
  lines: string[] = [];
  ngOnInit() {
    this.getCommentpProfile();
    this.lines = this.comment.text.split('\n');
  }

}
