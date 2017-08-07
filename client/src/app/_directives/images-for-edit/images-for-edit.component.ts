import { Component,Output, OnInit, Input,EventEmitter } from '@angular/core';
import { appConfig } from '../../app.config';

@Component({
  selector: 'app-images-for-edit',
  templateUrl: './images-for-edit.component.html',
  styleUrls: ['./images-for-edit.component.css']
})
export class ImagesForEditComponent implements OnInit {

  @Input() images;

  @Output() deleted: EventEmitter<string> = new EventEmitter();

  mouseOver: boolean = false;
  constructor() { }

  delete(image){
    let startIndex = image.indexOf("/uploads");
    let endIndex = image.indexOf("?token=");
    this.deleted.emit(image.substring(startIndex+('/uploads/').length,endIndex));
  }

  ngOnInit() {
     /* let token = JSON.parse(localStorage.getItem('currentUser')).token;
      let imagesUrl = [];
      for(let image of this.images){
        imagesUrl.push(appConfig.apiUrl + "/uploads/" + image+ "?token=" + token);
      }
      this.images = imagesUrl;*/
  }

}
