/**
 * @description AuthService provides all the functions of authentication.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { PRODUCT_URL } from '../config/url';

@Injectable()
export class AuthService {
    public refreshTokenInterval: number; // The id of refreshing token interval, which is used to clear the interval when signing out.

    constructor(
        private http: HttpClient
    ) { }

    /**
     * Fetch token from storage.
     * @returns {string}
     */
    getToken(): string {
        return localStorage.getItem('instant_pot_app_token');
    }

    /**
     * Save token in the storage.
     * @param {string} token 
     * @returns {void}
     */
    saveToken(token): void {
        localStorage.setItem('instant_pot_app_token', token);
    }

    /**
     * Remove token from storage.
     * @returns {void}
     */
    removeToken(): void {
        localStorage.removeItem('instant_pot_app_token');
    }

    /**
     * Get HttpHeaders.
     * @returns {HttpHeaders}
     */
    getHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: 'bearer ' + this.getToken()
        });
    }

    /**
     * Sign in the account with given email and password.
     * @param {string} email 
     * @param {string} password 
     * @returns {Observable<Object>}
     */
    signIn(email: string, password: string): Observable<Object> {
        return this.http.post(PRODUCT_URL + 'signin', { email, password });
    }

    /**
     * Create an account with given email and password.
     * @param {string} email 
     * @param {string} password 
     * @returns {Obvservable<Object>}
     */
    signUp(email: string, password: string): Observable<Object> {
        return this.http.post(PRODUCT_URL + 'signup', { email, password });
    }

    /**
     * Sign out the account. Both the stored token and refreshing token interval will be cleard.
     * @returns {void}
     */
    signOut(): void {
        this.removeToken();
        clearInterval(this.refreshTokenInterval);
    }

    /**
     * Cyclically refresh the token.
     * @returns {void}
     */
    refreshTokenCycle(): void {
        this.refreshTokenInterval = setInterval(
            () => this.refreshToken().subscribe(
                res => this.saveToken(res['token']),
                err => console.log(err)
            ), 1000 * 60 * 60 * 8
        );
    }

    /**
     * Request for new token with the old token.
     * @returns {Observable<Object>}
     */
    refreshToken(): Observable<Object> {
        return this.http.get(PRODUCT_URL + 'refresh-token', { headers: this.getHeaders() });
    }
}