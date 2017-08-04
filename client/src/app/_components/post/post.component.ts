import { Component, OnInit, Input,OnDestroy} from '@angular/core';
import { User, Post, ImgData, TextData } from '../../_models/index';
import { PostService,SocketService, UserService, ImagesService } from '../../_services/index'
import { DatePipe } from '@angular/common';
import { appConfig } from '../../app.config';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit,OnDestroy {
  //  @Input() post: Post;
  post: Post;

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
  connection;
  constructor(private socketService:SocketService, private imagesService: ImagesService ,private postService: PostService, private userService: UserService) { }
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
      this.initGalleryImages(0);
    });

    this.connection = this.socketService.observeServer(JSON.parse(localStorage.getItem('currentUser'))._id).subscribe(data => {
          this.getPostMembers();
    });

   
    

  }

  initMap() {
    if (this.post.location) {
      this.latitude = this.post.location.lat;
      this.longitude = this.post.location.lng;
      this.marker = this.post.location;
      this.zoom = 12;
      this.showmap = true;
    }
  }



  // images 
  galleryOptions: NgxGalleryOptions[][] = [];
  galleryImages: NgxGalleryImage[][] = [];

  initGalleryOptios(imgData:ImgData , i)  {
    this.galleryOptions[i] = [];
    if(imgData.imgsUrl.length > 1){
      this.galleryOptions[i] =[ { "imageAnimation": "slide" },
                                { "breakpoint": 500, "width": "300px", "height": "300px", "thumbnailsColumns": 3 },
                                { "breakpoint": 300, "width": "100%", "height": "200px", "thumbnailsColumns": 2 } ];
    }
    else {
      this.galleryOptions[i] = [ { "thumbnails": false },
                                 { "breakpoint": 100 } ];
    }
  }

  initGalleryImages(i) {
    let imgData: ImgData;
    let index = i;
    //find images i
    for(let data of this.post.data){
      if(data.imgsUrl){
          if(index == 0){  
            imgData = data;
          } 
          index --;
      }
        
     if(imgData){
        let token = JSON.parse(localStorage.getItem('currentUser')).token;
        this.initGalleryOptios(imgData, i);
        this.galleryImages[i] = [];
        for(let url of imgData.imgsUrl){
           this.galleryImages[i].push({
             small: appConfig.apiUrl+'/uploads/'+url+"?token="+token,
             medium: appConfig.apiUrl+'/uploads/'+url+"?token="+token,
             big: appConfig.apiUrl+'/uploads/'+url+"?token="+token,
           });
        }
        console.log(this.galleryImages[i]);
      }
      
    }

  }

  ngOnDestroy(){
    this.connection.unsubscribe();
  }

}
