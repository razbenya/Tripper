import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { customHttpProvider } from './custom-http';
import { AppComponent } from './app.component';
import { RegisterComponent } from './register/register.component';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './_directives/index';
import { AlertService, AuthenticationService, UserService, SocketService } from './_services/index';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './_guards/index';
import { ProfileComponent } from './profile/profile.component';


// Define the routes
const ROUTES = [

  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
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
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES) 
  ],
  providers: [
    customHttpProvider,
    AuthGuard,
    AlertService,
    AuthenticationService,
    UserService,
    SocketService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
