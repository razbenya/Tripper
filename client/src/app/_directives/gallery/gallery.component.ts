import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {

  @Input() datasource;
  @Input() maxPictures;
  selectedImage;
  imageContainer: string;

  constructor() { }

  ngOnInit() {
    switch (this.datasource.length) {
      case 1:
        this.imageContainer = "imageContainer1 list-group-item";
        break;
      case 2:
        this.imageContainer = "imageContainer2 list-group-item";
        break;
      default:
        this.imageContainer = "imageContainer3 list-group-item";
    }
  }


  navigate(forward) {
    var index = ((this.datasource.indexOf(this.selectedImage) + (forward ? 1 : -1)) + this.datasource.length) % +this.datasource.length;
    if (index >= 0 && index < this.datasource.length) {
      this.selectedImage = this.datasource[index];
    }
  }

  setSelectedImage(image) {
    this.selectedImage = image;
  }

}
