import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_URL } from '../config/url';

@Injectable()
export class AuthService {
    public token: string;
    public refreshTokenInterval: number; // The id of refreshing token interval, which is used to clear the interval when signing out.

    constructor(
        private http: HttpClient
    ) { }

    /**
     * Get HttpHeaders
     * @returns {HttpHeaders}
     */
    getHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: 'bearer ' + this.token
        })
    }

    /**
     * Sign in the account with given email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Observable<Object>}
     */
    signIn(email: string, password: string): Observable<Object> {
        return this.http.post(PRODUCT_URL + 'signin', { email, password });
    }

    /**
     * Create an account with given email and password
     * @param {string} email 
     * @param {string} password 
     * @returns {Obvservable<Object>}
     */
    signUp(email: string, password: string): Observable<Object> {
        return this.http.post(PRODUCT_URL + 'signup', { email, password });
    }

    /**
     * Sign out the account. Both the stored token and refreshing token interval will be cleard
     * @returns {void}
     */
    signOut(): void {
        this.token = null;
        clearInterval(this.refreshTokenInterval);
    }

    /**
     * Request for new tokens with the old token
     * @returns {void}
     */
    refreshToken(): void {
        this.refreshTokenInterval = setInterval(
            () => this.http.get(PRODUCT_URL + 'refresh-token', { headers: this.getHeaders() }).subscribe(
                res => this.token = res['token'],
                err => console.log(err)
            ), 1000 * 60 * 60 * 8
        )
    }
}