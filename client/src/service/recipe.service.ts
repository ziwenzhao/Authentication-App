/**
 * @description RecipeService provides all the functions in relation to recipes.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { Recipe } from '../models/recipe.model';
import { PRODUCT_URL } from '../config/url';

@Injectable()
export class RecipeService {
    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    /**
     * Get HttpHeaders.
     * @returns {HttpHeaders}
     */
    getHeaders(): HttpHeaders {
        const headers = new HttpHeaders({
            Authorization: 'bearer ' + this.authService.token
        });
        return headers;
    }

    /**
     * Fetch all recipes.
     * @returns {Observable<Recipe[]>}
     */
    getAllRecipes(): Observable<Recipe[]> {
        return this.http.get(PRODUCT_URL + 'recipes') as Observable<Recipe[]>
    }

    /**
     * Fetch all favorite recipes. The request needs to provide a valid token in the header.
     * @returns {Observable<Recipe[]>}
     */
    getFavRecipes(): Observable<Recipe[]> {
        return this.http.get(PRODUCT_URL + 'favorite-recipes', { headers: this.getHeaders() }) as Observable<Recipe[]>;
    }

    /**
     * Add a recipe to favorites with the given recipe Id. The request needs to provide a valid token in the header.
     * @param {string} id Recipe Id
     * @returns {Observable<Object>}
     */
    addFavRecipe(id: string): Observable<Object> {
        return this.http.patch(PRODUCT_URL + 'favorite-recipes/add/' + id, {}, { headers: this.getHeaders() });
    }

    /**
     * Delete a recipe from favorites with the given recipe Id. The request needs to provide a valid token in the header.
     * @param {string} id Recipe Id
     * @returns {Observable<Object>}
     */
    deleteFavRecipe(id: string): Observable<Object> {
        return this.http.patch(PRODUCT_URL + 'favorite-recipes/delete/' + id, {}, { headers: this.getHeaders() });
    }
}