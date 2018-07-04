/**
 * @description This file is used to export the mongoose model of Recipe and FavRecipe. 
 *              The FavRecipe is used to store favorite recipes for each user.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const recipeSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    imgUrl: String
});
const favRecipeSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    favRecipes: {
        type: [recipeSchema]
    }
})
const Recipe = mongoose.model('Recipe', recipeSchema);
const FavRecipe = mongoose.model('FavRecipe', favRecipeSchema);

module.exports = { Recipe, FavRecipe };