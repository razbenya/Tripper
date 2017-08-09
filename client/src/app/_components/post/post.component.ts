import { ViewChild, Component, OnInit, Input, OnDestroy,Output,EventEmitter } from '@angular/core';
import { User, Post, ImgData, TextData, Comment } from '../../_models/index';
import { PostService, SocketService, UserService, ImagesService } from '../../_services/index'
import { DatePipe } from '@angular/common';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() post: Post;
  @Output() ondelete: EventEmitter<string> = new EventEmitter();

  currentUser;
  showMoreElements = false;
  maxElements = 2;
  start = 0;
  end = 2;

  /* map */
  latitude: number;
  longitude: number;
  zoom: number;
  showmap: boolean = false;
  marker;
  members: {
    publisher: User,
    tagged: User[]
  };
  profilepic: any;
  others: string;
  likesUsersList: User[] = [];

  getLikesUsersList() {
    this.userService.getUsers(this.post.likes).subscribe(users=>{
      this.likesUsersList = users;
    })
  }

  like() {
    if(this.likeText == "like"){
      this.postService.like(this.post, this.currentUser).subscribe(() => {
        this.notifyLike();
      });
    } else {
       this.postService.unlike(this.post, this.currentUser).subscribe(() => {
        this.notifyLike();
      });
    }

  }

  notifyLike() {
    this.socketService.notifyServer('post', this.post._id);
  }


  getPostMembers() {
    let token = JSON.parse(localStorage.getItem('currentUser')).token;
    this.postService.getPostMembers(this.post).subscribe(members => {
      let index = members.findIndex(ele => ele._id == this.post.userId);
      let publisher = members[index];
      members.splice(index, 1);
      this.members = {
        publisher: publisher,
        tagged: members
      };

      this.others = this.members.tagged.length - 1 + " others";
      this.profilepic = appConfig.apiUrl + "/uploads/" + publisher.profilePic + "?token=" + token;
    })
  }


  mapClicked($event) {
    window.open("https://www.google.com/maps/dir/Current+Location/" + this.latitude + "," + this.longitude, '_blank');
  }

  date;
  userObserver;
  postObserver;
  currentUserprofilepic;

  constructor(private socketService: SocketService, private imagesService: ImagesService, private postService: PostService, private userService: UserService) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentUserprofilepic = appConfig.apiUrl+"/uploads/"+ this.currentUser.profilePic+"?token="+ this.currentUser.token;
  }


  ngOnInit() {
      this.latitude = 50;
      this.longitude = 50;
      this.checkLike() 
      this.getLikesUsersList();
      this.initMap();
      this.getPostMembers();
      let timeStamp = parseInt(this.post._id.toString().substr(0, 8), 16) * 1000
      this.date = new Date(timeStamp);

      this.postObserver = this.socketService.observeServer(this.post._id).subscribe((data) => {
        this.postService.getById(this.post._id).subscribe((post) => {
          this.post = post;
          this.getPostMembers();
          this.getLikesUsersList() 
          this.checkLike();
          this.initMap();
        });
      });

    this.userObserver = this.socketService.observeServer(JSON.parse(localStorage.getItem('currentUser'))._id).subscribe(data => {
      this.getPostMembers();
    });
  }

  getImgsUrl(i) {
    let imgData = this.post.data.find(ele => ele.index == i);
    let token = this.currentUser.token;
    let imagesUrl = [];
    if(imgData){
      for (let imageUrl of imgData.imgsUrl) {
        imagesUrl.push(appConfig.apiUrl + "/uploads/" + imageUrl + "?token=" + token);
      } 
    }
      return imagesUrl;
  }
  


  likeText: string = "like";
  likeIcon: string = "glyphicon glyphicon-thumbs-up";
  checkLike() {
    let index = this.post.likes.indexOf(this.currentUser._id);
    if(index >= 0){
      this.likeText = "unlike";
      this.likeIcon = "glyphicon glyphicon-thumbs-down";
    } else {
      this.likeText = "like";
      this.likeIcon = "glyphicon glyphicon-thumbs-up";
    }
  }


  initMap() {
    if (this.post.location) {
      this.latitude = this.post.location.lat;
      this.longitude = this.post.location.lng;
      this.marker = this.post.location;
      this.zoom = 16;
      this.showmap = true;
    } else {
      this.showmap = false;
    }
  }

 

  //comments 
  showComments: boolean = false;
 // @ViewChild('commentInput') ci: any;
  commentText: string = "";

  writeComment(){
      let newComment:Comment = {
        userId: this.currentUser._id,
        text: this.commentText,
        date: new Date(),
      }
      this.commentText = "";
      this.postService.writeComment(this.post,newComment).subscribe(() => {
        this.notifyLike();
      })
  }


  openComments() {
    if(this.showComments)
      this.end = 2;
    this.showComments = !this.showComments;
    //this.ci.nativeElement.focus();
  }

  remove(){
    this.postService.delete(this.post._id).subscribe(()=> {
      this.socketService.notifyServer('deletePost', this.post._id);
      this.ondelete.emit(this.post._id);
    })

  }

  ngOnDestroy() {
    this.userObserver.unsubscribe();
    this.postObserver.unsubscribe();
  }

}
