import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { customHttpProvider } from './custom-http';
import { AppComponent } from './app.component';
import { RegisterComponent, HomeComponent, LoginComponent, ProfileComponent, PostFormComponent } from './_components/index';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './_directives/index';
import { PostService, ImagesService, AlertService, AuthenticationService, UserService, SocketService } from './_services/index';
import { AuthGuard } from './_guards/index';
import { TextFormComponent } from './_components/text-form/text-form.component';
import { ImageUploadModule } from "angular2-image-upload";
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { AgmCoreModule } from '@agm/core';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { PostComponent } from './_components/post/post.component';
import { UserlistComponent } from './_directives/userlist/userlist.component';
import { GalleryComponent } from './_directives/gallery/gallery.component';
import { ElasticModule } from 'angular2-elastic';
import { CommentComponent } from './_components/comment/comment.component';
import { EditProfileComponent } from './_components/edit-profile/edit-profile.component';
import { UserCardComponent } from './_components/user-card/user-card.component';




// Define the routes
const ROUTES = [

  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'edit', component: EditProfileComponent},
  { path: ':id', component: ProfileComponent},
  
  // otherwise redirect to home
  { path: '**', redirectTo: '' }
];


@NgModule({
  declarations: [
    AppComponent,
    AlertComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AlertComponent,
    ProfileComponent,
    PostFormComponent,
    TextFormComponent,
    PostComponent,
    UserlistComponent,
    GalleryComponent,
    CommentComponent,
    EditProfileComponent,
    UserCardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    ReactiveFormsModule,
    Ng2AutoCompleteModule,
    Ng2Bs3ModalModule,
    ElasticModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyCOt9ge0TKiOEk_HboTuGOcdaa80U6IJp8',
      libraries: ["places"]
    }),
    ImageUploadModule.forRoot(),
    RouterModule.forRoot(ROUTES)
  ],
  providers: [
    customHttpProvider,
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    SocketService,
    ImagesService,
    PostService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
