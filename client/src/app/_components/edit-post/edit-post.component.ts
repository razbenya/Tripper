import { NgZone, ElementRef, Component, OnInit, OnDestroy, ViewChild,Input,Output ,EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Post, User, ImgData, TextData } from '../../_models/index';
import { ImagesService, PostService, AlertService, UserService } from '../../_services/index';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MapsAPILoader } from '@agm/core';
import { appConfig } from '../../app.config';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit, OnDestroy {

  @Input() post:Post
  //post: Post;
  @Input() modal;

  @Output() onModalClose: EventEmitter<string> = new EventEmitter();

  @ViewChild("search") searchElementRef: ElementRef;
  public myForm: FormGroup;
  uploadUrl: string;
  url: string;
  submit: boolean = false;
  currentUser;
  address;
  loading = false;
 

  /* Map and Location */
  latitude: number;
  longitude: number;
  searchControl;
  zoom: number;
  showmap: boolean = false;
  marker: {
    lat: number,
    lng: number
  };

  /* Tagged Friends */
  friendsList: User[];
  choosedUsers: {
    _id: string,
    firstName: string,
  }[] = [];
   tagged = false;
   addedTags: Set<string> = new Set([]);
   removedTags: Set<string> = new Set([]);

  /* images */
  images: ImgData[] = [];
  deletedImages: string[] = [];

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private userService: UserService, private _sanitizer: DomSanitizer, private router: Router, private alertService: AlertService, private postService: PostService, private imgService: ImagesService, private _fb: FormBuilder) {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.url = "/images"
    this.uploadUrl = this.url + "/uploads/" + this.currentUser._id;
  }

  sortArr(arr: any[]) {
    arr.sort((a, b) => {
      if (a.index < b.index)
        return -1;
      if (b.index < a.index)
        return 1;
      return 0;
    });
  }

  save() {
    let model = this.myForm.value;
    this.loading = true;
    let texts: any[] = [];
    let i: number = 0;
    for (let txt of model.postData) {
      if (txt.text) {
        texts.push({ index: i, text: txt.text });
      }
      i++;
    }
    let data: any[] = texts.concat(this.images);

    this.sortArr(data);
    let taggedId = [];

    for (let choosedUser of this.choosedUsers) {
      taggedId.push(choosedUser._id);
    }


    let newpost = {
      title: model.title,
      location: this.marker,
      taggedUsers: taggedId,
      data: data,
      toAdd: Array.from(this.addedTags),
      toRemove: Array.from(this.removedTags)
    }
    
    this.postService.update(newpost,this.post._id).subscribe((succ) => {
      this.loading = false;
      this.postService.getById(this.post._id).subscribe((post) => {
        this.post = post;
        this.onModalClose.emit('closed');
        this.modal.close();
      })
    }, (error) => {
      this.loading = false;
      this.alertService.error(error);
    });
  }

  ngOnInit() {
      this.myForm = this._fb.group({
        title: [this.post.title, [Validators.required, Validators.minLength(3)]],
        location: [""],
        tag: [''],
        postData: this._fb.array([])
      });

      this.initMap();
      this.initTagged();
      this.initData();



  }
    cancel(){
      this.postService.getById(this.post._id).subscribe((post) => {
        this.post = post;
        this.onModalClose.emit('closed');
        this.modal.close();
      })
    }

  initMap() {
    this.loadapi();
    if (this.post.location) {
      this.showmap = true;
      this.latitude = this.post.location.lat;
      this.longitude = this.post.location.lng;
      this.marker = {
        lat: this.latitude,
        lng: this.longitude
      }

    } else {
      this.setCurrentPosition();
    }
    this.zoom = 16;
    this.searchControl = this.myForm.controls['location'];
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
      });
    } else {
      this.latitude = 39.8282;
      this.longitude = -98.5795;
    }
  }

  loadapi() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["geocode"]
      });

      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }

          //set latitude, longitude and zoom
          this.latitude = place.geometry.location.lat();
          this.longitude = place.geometry.location.lng();
          this.zoom = 12;
        });
      });

    });
  }

  initTagged() {
    this.userService.getAll().subscribe(users => {
      this.friendsList = users;
    });
    this.userService.getUsers(this.post.taggedUsers).subscribe((users) => {
      for (let user of users) {
        this.choosedUsers.push({
          _id: user._id,
          firstName: user.firstName
        })
      }
      if(this.choosedUsers.length > 0)
         this.tagged = true;
    });
  }

  observableSource(keyword: any) {
    let filteredList = this.friendsList.filter(el => el._id.startsWith(keyword) && el._id != this.currentUser._id);
    return Observable.of(filteredList);
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.firstName} ${data.lastName} </span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }

  initText(index: number) {
    let data = this.post.data.find(ele => ele.index == index);
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this._fb.group({
      text: [data.text, Validators.required],
    }));
  }

  initImages(index: number) {
    let imgData = this.post.data.find(ele => ele.index == index && ele.imgsUrl);
    this.images.push(imgData);
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this._fb.group({
      image: [],
    }));
  }


  initData() {
    for (let data of this.post.data) {

      if (data.text) {
        this.initText(data.index);
      } else {
        this.initImages(data.index);
      }
    }
  }

  /* helper methods */

  // map 
  mapClicked($event) {
    this.marker = {
      lat: $event.coords.lat,
      lng: $event.coords.lng
    };
  }

  showMap() {
    this.showmap = !this.showmap;
  }

  // tagged 
  addTagging() {
    this.tagged = !this.tagged;
  }

  removeFromList(i: number) {
    let id = this.choosedUsers[i]._id;
    if(!this.addedTags.has(id))
      this.removedTags.add(id);
    else
      this.addedTags.delete(id);
    this.choosedUsers.splice(i, 1);
  }

  addTaggedUser(user) {
    this.myForm.controls['tag'].reset();
    if (user) {
      this.addedTags.add(user._id);
      this.choosedUsers.push({
        _id: user._id,
        firstName: user.firstName,
      });
    }
  }

  // text 
  addText() {
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this._fb.group({
      text: ['', Validators.required],
    }));
  }

  // images 
  addImgs() {
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this._fb.group({
      image: [],
    }));
  }



  getImagesUrl(i) {
    let imgData = this.images.find(ele => ele.index == i);
    let token = this.currentUser.token;
    let editImgsUrl = [];
    if(imgData){
      for (let imageUrl of imgData.imgsUrl) {
        editImgsUrl.push(appConfig.apiUrl + "/uploads/" + imageUrl + "?token=" + token);
        //imagesUrl.push(imageUrl);
      } 
    }
      return editImgsUrl;
  }


  spwapImg(i: number, j: number) {
    let ind_i: number = -1;
    let ind_j: number = -1;
    ind_i = this.images.findIndex(element => { return element.index == i; });
    ind_j = this.images.findIndex(element => { return element.index == j; });
    if (ind_i != -1)
      this.images[ind_i].index = j;
    if (ind_j != -1)
      this.images[ind_j].index = i;
    if (ind_j != -1 && ind_i != -1) {
      let tmp = this.images[ind_j];
      this.images[ind_j] = this.images[ind_i]
      this.images[ind_i] = tmp;
    }
  }

  checkImgData(i){
    return this.images.findIndex(ele => ele.index == i) >= 0
  }


  removeAllImgs(i: number) {
    let index = this.images.findIndex(ele => { return ele.index == i; });
    // find next image index..
    let next = this.images.find(ele=> ele.index > i );
    if(next)
      next.index = i;
    console.log(index);
    if (index >= 0)
      this.images.splice(index, 1);
  }

  imageDeleted(imageUrl, i) {
    let index = this.images.findIndex(ele => { return ele.index == i; });
    let imgs = this.images[index];
    let ind = imgs.imgsUrl.indexOf(imageUrl);
    if (ind >= 0) {
      imgs.imgsUrl.splice(ind, 1);
    }
    if (imgs.imgsUrl.length == 0)
      this.images.splice(index, 1);
    this.deletedImages.push(imageUrl);
  }

  onUploadFinished(file, i: number) {
    let imgUrl: string = file.serverResponse._body;
    let found: boolean = false;
    let index = this.images.findIndex(ele => { return ele.index == i; });
    if (index >= 0) {
      this.images[index].imgsUrl.push(imgUrl);
    } else {
      this.images.push({
        index: i,
        imgsUrl: [imgUrl]
      });
    }
  }

  //data 
  swap(i: number, j: number) {
    const control = <FormArray>this.myForm.controls['postData'];
    let tmp = control.at(i);
    control.insert(i, control.at(j));
    control.removeAt(i + 1);
    control.insert(j, tmp);
    control.removeAt(j + 1);
    this.spwapImg(i, j);
  }

  remove(i: number) {
    const control = <FormArray>this.myForm.controls['postData'];
    control.removeAt(i);
    this.removeAllImgs(i);
  }

  ngOnDestroy(): void {

  }

}
