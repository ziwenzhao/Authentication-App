import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { AuthService } from '../service/auth.service';
import { RecipeListPage } from '../pages/recipe-list/recipe-list';
import { AuthPage } from '../pages/auth/auth';
import * as NAME_CONSTANTS from '../config/name-constants';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) private nav: Nav;
  private rootPage: any = AuthPage;
  private pages: Array<{ title: string, icon: string, component: any, data: any }>; // The navigations pages in the menu.
  private NAME_CONSTANTS = NAME_CONSTANTS;

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    private authSerivce: AuthService,
    private screenOrientation: ScreenOrientation
  ) {
    this.initializeApp();
    this.pages = [
      { title: 'Home', icon: 'ios-list', component: RecipeListPage, data: { mode: 'all' } },
      { title: 'Favorite', icon: 'ios-heart-outline', component: RecipeListPage, data: { mode: 'fav' } },
    ];
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      if (!this.platform.is('core')) {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT); // Lock the screen in portrait orientation.
      }
    });
  }

  onOpenPage(page) {
    this.nav.setRoot(page.component, page.data);
  }

  onLogOut() {
    this.authSerivce.signOut();
    this.nav.setRoot(AuthPage);
  }
}
