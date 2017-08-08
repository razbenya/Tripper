import { NgZone, ElementRef, Component, OnInit, OnDestroy, Input, ViewChild,Output, EventEmitter } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Post, User, ImgData, TextData } from '../../_models/index';
import { ImagesService, PostService, AlertService, UserService } from '../../_services/index';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MapsAPILoader } from '@agm/core';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.css']
})

export class PostFormComponent implements OnInit, OnDestroy {


  @ViewChild("search") searchElementRef: ElementRef;
  @Input() modal;
  @Output() onclose: EventEmitter<string> = new EventEmitter();
  

  public myForm: FormGroup;
  uploadUrl: string;
  url: string;
  submit: boolean = false;
  currentUser;
  address;
  loading = false;
  tagged = false;

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


    let post: Post = {
      _id: undefined,
      userId: this.currentUser._id,
      likes: [],
      comments: [],
      taggedUsers: taggedId,
      title: model.title,
      location: this.marker,
      data: data,
      likesNum: 0
    }


    this.postService.create(post).subscribe(
      succ => {
        this.submit = true;
        this.loading = false;
        this.alertService.success("post published successfully", true);
        const control = <FormArray>this.myForm.controls['postData'];
        for(let i=0;i<control.length;i++)
          control.removeAt(i);
        this.myForm.reset();
        this.images = [];
        this.onclose.emit('close');
        this.modal.close();
      },
      error => {
        this.alertService.error(error);
        this.submit = false;
        this.loading = false;
      }
    )
  }

  ngOnInit() {
    this.loadapi();
    this.myForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: [""],
      tag: [''],
      postData: this._fb.array([])
    });

    this.zoom = 4;
    this.latitude = 39.8282;
    this.longitude = -98.5795;
    this.searchControl = this.myForm.controls['location'];
    this.loadAllUsers();
  }

  cancel() {
     const control = <FormArray>this.myForm.controls['postData'];
        for(let i=0;i<control.length;i++)
          control.removeAt(i);
        this.myForm.reset();
        this.images = [];
        this.modal.close();
  }

  initText() {
    return this._fb.group({
      text: ['', Validators.required],
    });
  }

  addText() {
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this.initText());
  }


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

  addTagged() {
    this.tagged = !this.tagged;
  }

  /* Map and Location */
  latitude: number;
  longitude: number;
  searchControl;
  zoom: number;
  first: boolean = true;
  showmap: boolean = false;
  marker: {
    lat: number,
    lng: number
  };

  mapClicked($event) {
    this.marker = {
      lat: $event.coords.lat,
      lng: $event.coords.lng
    };
  }


  showMap() {
    this.showmap = !this.showmap;
    
  }

  private setCurrentPosition() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 4;
      });
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





  /* Tagged Friends */
  friendsList: User[];
  tagger: string;
  choosedUsers: {
    _id: string,
    firstName: string,
  }[] = [];


  observableSource(keyword: any) {
    let filteredList = this.friendsList.filter(el => el._id.startsWith(keyword) && el._id!=this.currentUser._id);
    return Observable.of(filteredList);
  }

  removeFromList(i: number) {
    this.choosedUsers.splice(i, 1);
  }

  addTaggedUser(user) {
    this.myForm.controls['tag'].reset();
    if (user) {
      this.choosedUsers.push({
        _id: user._id,
        firstName: user.firstName,
      });
    }

  }

  private loadAllUsers() {
    this.userService.getAll().subscribe(users => {
      this.friendsList = users;
      let index = this.friendsList.findIndex(ele => ele._id = this.currentUser._id);
      if (index > -1) {
        this.friendsList.splice(index, 1);
      }
    });
  }

  autocompleListFormatter = (data: any): SafeHtml => {
    let html = `<span>${data.firstName} ${data.lastName} </span>`;
    return this._sanitizer.bypassSecurityTrustHtml(html);
  }


  /* images */
  images: ImgData[] = [];

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

  initImgs() {
    return this._fb.group({
      image: [],
    })
  }

  removeAllImgs(i: number) {
   let index = this.images.findIndex(ele => { return ele.index == i; });
    // find next image index..
    let next = this.images.find(ele=> ele.index > i );
    if(next)
      next.index = i;
    if (index >= 0)
      this.images.splice(index, 1);
  }

  addImgs() {
    const control = <FormArray>this.myForm.controls['postData'];
    control.push(this.initImgs());
  }

  imageRemoved(file, i: number) {
    let index = this.images.findIndex(ele => { return ele.index == i; });
    let imgs = this.images[index];
    let ind = imgs.imgsUrl.indexOf(file.serverResponse._body);
    if (ind >= 0) {
      imgs.imgsUrl.splice(ind, 1);
    }
    if (imgs.imgsUrl.length == 0)
      this.images.splice(index, 1);
    this.imgService.deleteImage(this.url, file.serverResponse._body).subscribe();
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

  ngOnDestroy(): void {
    if (!this.submit) {
      for (let imgs of this.images) {
        for (let path of imgs.imgsUrl) {
          this.imgService.deleteImage(this.url, path).subscribe();
        }
      }
    }
  }

}


