/**
 * @description MessageService provides all the functions of showing differnet types of messages.
 */
import { Injectable } from '@angular/core';
import { AlertController } from 'ionic-angular';
import * as NAME_CONSTANTS from '../config/name-constants';

@Injectable()
export class MessageService {
    constructor(private alertCtrl: AlertController) { }

    /**
     * Show Alert with the given title and message.
     * @param {string} title Alert Title
     * @param {string} [message] Alert Message
     * @returns {void}
     */
    showAlert(title: string, message?: string) {
        const alert = this.alertCtrl.create({
            title,
            message: message || '',
            buttons: [NAME_CONSTANTS.GENERAL.OK]
        });
        alert.present();
    }
}

