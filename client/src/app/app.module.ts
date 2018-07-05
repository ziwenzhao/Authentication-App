import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { HttpClientModule } from '@angular/common/http';


import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { AuthService } from '../service/auth.service';
import { RecipeService } from '../service/recipe.service';
import { DataService } from '../service/data.service';
import { MessageService } from '../service/show-message';

import { MyApp } from './app.component';
import { RecipeListPage } from '../pages/recipe-list/recipe-list';
import { AuthPage } from '../pages/auth/auth';
import { RecipeDetailsPage } from '../pages/recipe-details/recipe-details';




@NgModule({
  declarations: [
    MyApp,
    RecipeListPage,
    AuthPage,
    RecipeDetailsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ReactiveFormsModule,
    HttpClientModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    RecipeListPage,
    AuthPage,
    RecipeDetailsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    AuthService,
    RecipeService,
    DataService,
    MessageService,
    ScreenOrientation
  ]
})
export class AppModule { }
