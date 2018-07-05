import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Observable } from 'rxjs';
import { RecipeService } from '../../service/recipe.service';
import { DataService } from '../../service/data.service';
import { MessageService } from '../../service/show-message';
import { RecipeDetailsPage } from '../recipe-details/recipe-details';
import { Recipe } from '../../models/recipe.model';
import * as NAME_CONSTANTS from '../../config/name-constants';

@Component({
  selector: 'page-recipe-list',
  templateUrl: 'recipe-list.html'
})
export class RecipeListPage {
  private mode: string;  // Mode of the list page, displaying either all recipes or favorite recipes.
  private recipes: Recipe[] = [];
  private showFavEmpty = false;  // The flag of empty favorites message display.
  private loader: any;  //  Loading controller.
  private NAME_CONSTANTS = NAME_CONSTANTS;

  constructor(
    private navCtrl: NavController,
    private navParams: NavParams,
    private loadingCtrl: LoadingController,
    private recipeService: RecipeService,
    private dataService: DataService,
    private msgService: MessageService
  ) { }

  ngOnInit() {
    this.loader = this.loadingCtrl.create({
      content: NAME_CONSTANTS.RECIPE.FETCH_RECIPES_LOADING
    });
    this.loader.present();
    this.mode = this.navParams.get('mode');
    // Fetch all recipes or favorite recipes.
    if (this.mode === 'all') {
      this.getRecipes(this.recipeService.getAllRecipes());
    } else {
      this.getRecipes(this.recipeService.getFavRecipes());
      // Listen to the toggle favorite event.
      // If a recipe is added to favorites, push it to the favorite list.
      // If a recipe is removed from favorites, delete it from the favorite list.
      this.dataService.toggleFavSubject.subscribe(
        data => {
          if (data.value) {
            if (!this.recipes.find(recipe => recipe._id === data.recipe._id)) {
              this.recipes.push(data.recipe);
              this.checkFavRecipesEmpty();
            }
          } else {
            const index = this.recipes.findIndex(recipe => recipe._id === data.recipe._id);
            if (index !== -1) {
              this.recipes.splice(index, 1);
              this.checkFavRecipesEmpty();
            }
          }
        }
      );
    };
  }

  /**
   * Handle the request of fetching all recipes or favorite recipes.
   * @param {Observable<Recipe[]>} request The request of fetching recipes
   * @returns {void}
   */
  getRecipes(request: Observable<Recipe[]>): void {
    request.subscribe(
      res => {
        this.loader.dismiss();
        this.recipes = res;
        this.checkFavRecipesEmpty();
      },
      err => {
        this.msgService.showAlert(NAME_CONSTANTS.RECIPE.FETCH_RECIPES_FAIL);
      }
    )
  }

  /**
   * Go to recipe details page with the given recipe.
   * @param {Recipe} recipe 
   * @returns {void}
   */
  onRecipeDetails(recipe: Recipe): void {
    this.navCtrl.push(RecipeDetailsPage, recipe);
  }

  /**
   * Upate the display flag showFavEmpty of empty favorites message.
   * @returns {void}
   */
  checkFavRecipesEmpty(): void {
    if (this.recipes.length === 0 && this.mode === 'fav') {
      this.showFavEmpty = true;
    } else {
      this.showFavEmpty = false;
    }
  }
}
