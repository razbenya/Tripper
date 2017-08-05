import { ViewChild, Component, OnInit, Input,OnDestroy} from '@angular/core';
import { User, Post, ImgData, TextData } from '../../_models/index';
import { PostService,SocketService, UserService, ImagesService } from '../../_services/index'
import { DatePipe } from '@angular/common';
import { appConfig } from '../../app.config';
//import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit,OnDestroy {
  //  @Input() post: Post;
  post;
  currentUser;



  /* map */
  latitude: number;
  longitude: number;
  zoom: number;
  showmap: boolean = false;
  marker;
  members : {
    publisher: User,
    tagged: User[]
  };
  profilepic: any;
  others: string;

  like() {
    let userId = this.currentUser._id;
    this.postService.like(this.post,userId).subscribe(() => {
      this.notifyLike();
    });
    
  }

  notifyLike(){
    
    this.socketService.notifyServer('post', this.post._id);
  }
  
  
  getPostMembers(){
     let token = JSON.parse(localStorage.getItem('currentUser')).token;
    this.postService.getPostMembers(this.post).subscribe(members => {
      let index = members.findIndex(ele => ele._id == this.post.userId);
      let publisher = members[index];
      members.splice(index,1);
      this.members = {
        publisher: publisher,
        tagged: members
      };
      
      this.others = this.members.tagged.length-1 + " others";
      this.profilepic = appConfig.apiUrl+"/uploads/"+publisher.profilePic+"?token="+token;
    })
  }


  mapClicked($event){
    window.open("https://www.google.com/maps/dir/Current+Location/"+this.latitude+","+this.longitude,'_blank');
  }

  date;
  userObserver;
  postObserver;
  
  constructor(private socketService:SocketService, private imagesService: ImagesService ,private postService: PostService, private userService: UserService) {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
   }

   
  ngOnInit() {
    this.latitude = 50;
    this.longitude = 50;

    /* for testing */
    this.postService.getAll().subscribe(posts => {
      this.post = posts[0];
      this.initMap();
      this.getPostMembers();
      let timeStamp = parseInt(posts[0]._id.toString().substr(0,8), 16)*1000
      this.date = new Date(timeStamp);
      this.initImages();

      this.postObserver = this.socketService.observeServer(this.post._id).subscribe((data) => {
        this.postService.getById(this.post._id).subscribe((post)=> {
          this.post = post;
        });
    });
    });


    this.userObserver = this.socketService.observeServer(JSON.parse(localStorage.getItem('currentUser'))._id).subscribe(data => {
          this.getPostMembers();
    });



  }



  initMap() {
    if (this.post.location) {
      this.latitude = this.post.location.lat;
      this.longitude = this.post.location.lng;
      this.marker = this.post.location;
      this.zoom = 16;
      this.showmap = true;
    }
  }

  initImages(){
    let token = JSON.parse(localStorage.getItem('currentUser')).token;
     for(let data of this.post.data){
        if(data.imgsUrl){
          let urls = [];
          for(let url of data.imgsUrl){
            urls.push(appConfig.apiUrl+"/uploads/"+url+"?token="+token);
          }
          data.imgsUrl = urls;
        }
     }
  }

  //comments 
  showComments:boolean = false;
  @ViewChild('commentInput') ci: any;
  
  openComments(){
    this.showComments = !this.showComments;
    this.ci.nativeElement.focus();
  }

  ngOnDestroy(){
    this.userObserver.unsubscribe();
    this.postObserver.unsubscribe();
  }

}
