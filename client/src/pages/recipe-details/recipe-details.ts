import { Component } from '@angular/core';
import { NavParams, AlertController, LoadingController } from 'ionic-angular';
import { RecipeService } from '../../service/recipe.service';
import { DataService } from '../../service/data.service';
import { MessageService } from '../../service/show-message';
import { Recipe } from '../../models/recipe.model';
import * as NAME_CONSTANTS from '../../config/name-constants';

@Component({
  selector: 'page-recipe-details',
  templateUrl: 'recipe-details.html',
})
export class RecipeDetailsPage {
  private recipe: Recipe;
  private isFav = false; // If this recipe has already been added to favorites.

  constructor(
    private navParams: NavParams,
    private recipeService: RecipeService,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private dataService: DataService,
    private msgService: MessageService
  ) {
  }

  ngOnInit() {
    const loader = this.loadingCtrl.create({
      content: NAME_CONSTANTS.RECIPE.FETCH_RECIPE_LOADING
    });
    loader.present();
    this.recipe = this.navParams.data;
    this.recipeService.getFavRecipes().subscribe(
      res => {
        loader.dismiss();
        this.isFav = res.find(recipe => recipe._id === this.recipe._id) ? true : false;
      },
      err => this.msgService.showAlert(NAME_CONSTANTS.RECIPE.CHECK_FAV_STATUS_FAIL)
    );
  }

  /**
   * Toggle the favorite status of this recipe both in database and local storage, 
   * and globally emit the toggle event
   * @returns {void}
   */
  onToggleFav(): void {
    if (this.isFav) {
      this.recipeService.deleteFavRecipe(this.recipe._id).subscribe(
        res => {
          this.isFav = false;
          this.dataService.toggleFavSubject.next({
            value: false,
            recipe: this.recipe
          })
        },
        err => this.msgService.showAlert(NAME_CONSTANTS.RECIPE.DELETE_FAV_FAIL)
      )
    } else {
      this.recipeService.addFavRecipe(this.recipe._id).subscribe(
        res => {
          this.isFav = true;
          this.dataService.toggleFavSubject.next({
            value: true,
            recipe: this.recipe
          })
        },
        err => this.msgService.showAlert(NAME_CONSTANTS.RECIPE.ADD_FAV_FAIL, err.error.message)
      )
    }
  }
}
