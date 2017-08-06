import { Component, OnInit } from '@angular/core';
import { UserService, ImagesService } from '../../_services/index'
import { appConfig } from '../../app.config';
import { Router } from '@angular/router';
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {

  constructor(private router: Router,private userService:UserService, private imgService:ImagesService) { }
  currentProfilePicture;
  newpicture;
  oldpicture;
  currentUser;
  uploadUrl;
  data;
  cropperSettings;
  imageUploaded = false;

  ngOnInit() {
    
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + this.currentUser.profilePic + "?token=" + this.currentUser.token;
    this.newpicture = this.currentUser.profilePic;
    this.uploadUrl = "/images/uploads/" + this.currentUser._id;
    this.initCropper();
  }



  onUploadFinished(file) {
    let imgUrl: string = file.serverResponse._body;
    this.data = file.file;
    this.imageUploaded = true;
    this.oldpicture = this.newpicture;
    this.newpicture = imgUrl;
    this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + imgUrl + "?token=" + this.currentUser.token;
  }

  imageRemoved(file) {
    this.imgService.deleteImage("/images", file.serverResponse._body).subscribe();
    this.newpicture = this.oldpicture;
    this.currentProfilePicture = appConfig.apiUrl + "/uploads/" + this.oldpicture+ "?token=" + this.currentUser.token;
  }

  save(){
    this.userService.update({firstName: this.currentUser.firstName, lastName:this.currentUser.lastName, profilePic: this.newpicture },this.currentUser._id).subscribe(()=>{
        this.currentUser.profilePic = this.newpicture;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
         this.router.navigate(['/']);
    });
  }


  initCropper(){
    this.cropperSettings = new CropperSettings();
    this.cropperSettings.width = 100;
    this.cropperSettings.height = 100;
    this.cropperSettings.croppedWidth =100;
    this.cropperSettings.croppedHeight = 100;
    this.cropperSettings.canvasWidth = 400;
    this.cropperSettings.canvasHeight = 300;

    this.data = {};
  }
}
