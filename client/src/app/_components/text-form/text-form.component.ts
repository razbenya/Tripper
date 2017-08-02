import { Component, Input  } from '@angular/core';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-text-form',
  templateUrl: './text-form.component.html',
  styleUrls: ['./text-form.component.css']
})
export class TextFormComponent {
  @Input('group')
  public textForm: FormGroup;


  constructor() { }


}
