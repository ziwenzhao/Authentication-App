import { Component } from '@angular/core';
import { NavController, AlertController, LoadingController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../service/auth.service';
import { MessageService } from '../../service/show-message';
import { RecipeListPage } from '../recipe-list/recipe-list';
import * as NAME_CONSTANTS from '../../config/name-constants';

@Component({
  selector: 'page-auth',
  templateUrl: 'auth.html',
})
export class AuthPage {
  private mode = 'signin'; // Mode of this auth page, either 'signin' or 'signup'
  private form = this.fb.group({
    email: ['', [Validators.email, Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });
  private NAME_CONSTANTS = NAME_CONSTANTS;
  constructor(
    private navCtrl: NavController,
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private msgService: MessageService
  ) {
  }

  onSubmit() {
    if (this.form.controls.email.errors) {
      return this.msgService.showAlert(
        this.mode === 'signin' ? NAME_CONSTANTS.AUTH.SIGN_IN_FAIL : NAME_CONSTANTS.AUTH.SIGN_UP_FAIL,
        NAME_CONSTANTS.ERROR.EMAIL
      )
    }
    if (this.form.controls.password.errors) {
      return this.msgService.showAlert(
        this.mode === 'signin' ? NAME_CONSTANTS.AUTH.SIGN_IN_FAIL : NAME_CONSTANTS.AUTH.SIGN_UP_FAIL,
        NAME_CONSTANTS.ERROR.PASSWORD
      );
    }
    if (this.mode === 'signin') {
      this.authRequest(this.authService.signIn(this.form.value.email, this.form.value.password));
    } else {
      this.authRequest(this.authService.signUp(this.form.value.email, this.form.value.password));
    }
  }

  /**
   * Handle the authentication request and its overhead.
   * @param {Observable<Object>} request Authentication Request
   * @returns {void}
   */
  authRequest(request: Observable<Object>): void {
    const loader = this.loadingCtrl.create({
      content: this.mode === 'signin' ? NAME_CONSTANTS.AUTH.SIGN_IN_LOADING : NAME_CONSTANTS.AUTH.SIGN_UP_LOADING
    });
    loader.present();
    request.subscribe(
      res => {
        loader.dismiss();
        this.authService.token = res['token']; // Store the retrieved token in the service for later usage
        this.navCtrl.setRoot(RecipeListPage, { mode: 'all' });
      },
      err => {
        loader.dismiss();
        this.msgService.showAlert(
          this.mode === 'signin' ? NAME_CONSTANTS.AUTH.SIGN_IN_FAIL : NAME_CONSTANTS.AUTH.SIGN_UP_FAIL,
          err.error.message
        );
      }
    )
  }

  onSwitch() {
    this.mode = this.mode === 'signin' ? 'signup' : 'signin';
    this.form.reset();
  }

}
