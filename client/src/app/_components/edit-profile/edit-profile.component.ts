import { Component, ViewChild, OnInit } from '@angular/core';
import { UserService, ImagesService } from '../../_services/index'
import { appConfig } from '../../app.config';
import { Router } from '@angular/router';
import { ImageCropperComponent, CropperSettings } from 'ng2-img-cropper';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  constructor(private router: Router, private userService: UserService, private imgService: ImagesService) { }
  currentProfilePicture;
  newpicture;
  oldpicture;
  currentUser;
  uploadUrl;
  data;
  cropperSettings;
  imageUploaded = false;
  imageName: string;
  loading:boolean = false;

  @ViewChild('cropper', undefined)
  cropper: ImageCropperComponent;

  ngOnInit() {

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + this.currentUser.profilePic + "?token=" + this.currentUser.token;
    this.newpicture = this.currentUser.profilePic;
    this.uploadUrl = "/images/uploads/" + this.currentUser._id;
    this.initCropper();
  }

  onUploadFinished(fileEvent) {
    /* let imgUrl: string = fileEvent.serverResponse._body;
     this.imageUploaded = true;
     this.oldpicture = this.newpicture;
     this.newpicture = imgUrl;
     this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + imgUrl + "?token=" + this.currentUser.token;*/

    this.oldpicture = this.newpicture;
    this.imageUploaded = true;
    var image: any = new Image();
    var file: File = fileEvent.file;
    var myReader: FileReader = new FileReader();
    var that = this;
  
    myReader.onloadend = function (loadEvent: any) {
      image.src = loadEvent.target.result;
      that.cropper.setImage(image);
    };
    myReader.readAsDataURL(file);


  }

  imageRemoved(file) {
    this.imageUploaded = false;
    this.data = {};
    this.newpicture = this.oldpicture;
    this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + this.oldpicture + "?token=" + this.currentUser.token;
  }

  save() {
    this.loading = true;
    this.imgService.postImage(this.uploadUrl, this.data).subscribe((res) => {
      if (this.oldpicture != "default.jpg")
        this.imgService.deleteImage('/images', this.oldpicture).subscribe();
      this.newpicture = res['_body'];
      console.log(this.newpicture);
      this.userService.update({ firstName: this.currentUser.firstName, lastName: this.currentUser.lastName, profilePic: this.newpicture }, this.currentUser._id).subscribe(() => {
        this.currentUser.profilePic = this.newpicture;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.loading=false;
        this.router.navigate(['/']);
      });
    });
  }


  initCropper() {
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.noFileInput = true;
    this.cropperSettings.croppedWidth = 160;
    this.cropperSettings.croppedHeight = 160;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 300;
    //this.cropperSettings.preserveSize = true;
    this.data = {};
  }
}
