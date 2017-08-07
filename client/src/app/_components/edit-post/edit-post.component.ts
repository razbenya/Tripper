import { NgZone, ElementRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Validators, FormGroup, FormArray, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Post, User, ImgData, TextData } from '../../_models/index';
import { ImagesService, PostService, AlertService, UserService } from '../../_services/index';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { MapsAPILoader } from '@agm/core';
import 'rxjs/add/observable/of';

@Component({
  selector: 'app-edit-post',
  templateUrl: './edit-post.component.html',
  styleUrls: ['./edit-post.component.css']
})
export class EditPostComponent implements OnInit, OnDestroy {

  //@Input() post:Post

  

  @ViewChild("search") searchElementRef: ElementRef;
  public myForm: FormGroup;
  uploadUrl: string;
  url: string;
  submit: boolean = false;
  currentUser;
  address;
  loading = false;
  tagged = false;

  constructor(private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private userService: UserService, private _sanitizer: DomSanitizer, private router: Router, private alertService: AlertService, private postService: PostService, private imgService: ImagesService, private _fb: FormBuilder) {
  /*  this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.url = "/images"
    this.uploadUrl = this.url + "/uploads/" + this.currentUser._id;
     

    window['edit-post'] = {
      component: this,
      submit: () => this.save(), 
      valid: () => {return this.myForm.invalid && !this.loading; } , 
      zone: ngZone
    };*/
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

 /* save() {
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
      data: data
    }*/

  // change
   /* this.postService.create(post).subscribe(
      succ => {
        this.submit = true;
        this.loading = false;
        this.alertService.success("post published successfully", true);
        const control = <FormArray>this.myForm.controls['postData'];
        for(let i=0;i<control.length;i++)
          control.removeAt(i);
        this.myForm.reset();
        this.router.navigate(['/']);
      },
      error => {
        this.alertService.error(error);
        this.submit = false;
        this.loading = false;
      }
    )
  }*/

ngOnInit() {
    //this.loadapi();
    this.myForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      location: [""],
      tag: [''],
      postData: this._fb.array([])
  });
}

  ngOnDestroy(): void {
    throw new Error("Method not implemented.");
  }

}
