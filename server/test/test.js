/**
 * @description This file is used to test all the REST APIs.
 */
const request = require('supertest');
const expect = require('expect');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('../index.js');
const mongoose = require('../db/mongoose');
const User = require('../models/user');
const Image = require('../models/image');
const { FavRecipe, Recipe } = require('../models/recipe');
const { SECRET_KEY } = require('../config/auth')

let init_user; // The initial user before each test.
let init_recipes; // The initial recipes before each test.

// Before each test, it needs to reinitialize the data in the database.
beforeEach(done => {
    User.remove({}, () => {
        const user1 = new User({
            email: 'ziwenzzw@gmail.com',
            password: '123456'
        });
        user1.save((err, user) => {
            init_user = user;
            FavRecipe.remove({}, () => {
                Recipe.find((err, recipes) => {
                    init_recipes = recipes;
                    const favRecipe = new FavRecipe({
                        userId: user.id,
                        favRecipes: [recipes[0]]
                    });
                    favRecipe.save((err, fav) => { done() });
                })
            })
        })
    });
});

// The test group of authentication APIs.
describe('User Authentication API Test', () => {

    // The subgroup of POST '/signup' API.
    describe('Sign Up API Test', () => {
        it('should sign up a user.', done => {
            request(app)
                .post('/signup')
                .send({
                    email: 'test@gmail.com',
                    password: '123456'
                })
                .expect(200)
                .expect(res => {
                    expect(res.body.email).toBe('test@gmail.com');
                    expect(res.body.token).toBeTruthy();
                    expect(res.body.id).toBeTruthy();
                })
                .end(done);
        });

        it('should return an error of status 409 if this user already exist.', done => {
            request(app)
                .post('/signup')
                .send({
                    email: 'ziwenzzw@gmail.com',
                    password: '123456'
                })
                .expect(409)
                .end(done);
        });

        it('should give an error of status 422 if email or password is empty.', done => {
            request(app)
                .post('/signup')
                .send({})
                .expect(422)
                .end(done);
        });

        it('should give an error of status 422 if the form of email or password is not correct', done => {
            request(app)
                .post('/signup')
                .send({ email: 'test', password: '134' })
                .expect(422)
                .end(done);
        });
    });

    // The subgroup of POST '/signin' API.
    describe('Sign In API Test', () => {
        it('should sign in a user,', done => {
            request(app)
                .post('/signin')
                .send({ email: 'ziwenzzw@gmail.com', password: '123456' })
                .expect(200)
                .end(done);
        });

        it('should return an error of status 404 if the user does not exist.', done => {
            request(app)
                .post('/signin')
                .send({ email: 'test@gmail.com', password: 123456 })
                .expect(404)
                .end(done);
        });

        it('should give an error of status 404 if email or password is empty.', done => {
            request(app)
                .post('/signin')
                .send({})
                .expect(422)
                .end(done);
        });

        it('should give an error of status 422 if the form of email or password is not correct', done => {
            request(app)
                .post('/signin')
                .send({ email: 'test', password: '134' })
                .expect(422)
                .end(done);
        });
    });

    // The subgroup of GET '/refresh-token' API.
    describe('Refresh Token API Test', () => {
        it('should return a token upon authorized request', done => {
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .get('/refresh-token')
                .set({ Authorization: 'bearer ' + token })
                .expect(200)
                .expect(res => {
                    expect(jwt.verify(res.body.token, SECRET_KEY).id).toBe(init_user.id);
                })
                .end(done);
        });
    });
});

// The test group of recipe APIs.
describe('Recipe API Test', () => {

    // The subgroup of GET '/recipes' API.
    describe('Get Recipes API Test', () => {
        it('should return 3 recipes', done => {
            request(app)
                .get('/recipes')
                .expect(200)
                .expect(res => {
                    expect(res.body.length).toBe(3);
                })
                .end(done);
        });
    });

    // The subgroup of PATCH '/favorite-recipes/add/:id' API.
    describe('Add Favorite Recipe API Test', () => {
        it('should add a favorite recipe', done => {
            const recipe = init_recipes[1];
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/add/' + recipe.id)
                .set({ Authorization: 'bearer ' + token })
                .expect(200)
                .expect(res => {
                    FavRecipe.findOne({ userId: init_user.id }, (err, favRecipe) => {
                        const newFav = favRecipe.favRecipes.find(item => item.id === recipe.id);
                        expect(newFav).toBeTruthy();
                        expect(newFav.id).toBe(recipe.id);
                        expect(newFav.title).toBe(recipe.title);
                        expect(newFav.description).toBe(recipe.description);
                    })
                })
                .end(done);
        });

        it('should not add the same recipe to favorites', done => {
            const recipe = init_recipes[0];
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/add/' + recipe.id)
                .set({ Authorization: 'bearer ' + token })
                .expect(200)
                .expect(res => {
                    console.log(res);
                    FavRecipe.findOne({ userId: init_user.id }, (err, favRecipe) => {
                        expect(favRecipe.favRecipes.length).toBe(1);
                    })
                })
                .end(done);
        });

        it('should return an error of status 401 if no token is provided in the header', done => {
            request(app)
                .patch('/favorite-recipes/add/' + init_recipes[1].id)
                .expect(401)
                .end(done);
        });

        it('should return an error of status 401 if token format is not correct', done => {
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/add/' + init_recipes[1].id)
                .set({ Authoriztion: token })
                .expect(401)
                .end(done);
        });

        it('should return an error of status 401 if an unauthorized token is provided', done => {
            fakeToken = '12345abcde';
            request(app)
                .patch('/favorite-recipes/add/' + init_recipes[1].id)
                .set({ Authorization: 'bearer ' + fakeToken })
                .expect(401)
                .end(done);
        });

        it('should return an error of status 400 if the provided recipe id is invalid', done => {
            const fakeId = "12345abcde";
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/add/' + fakeId)
                .set({ Authorization: 'bearer ' + token })
                .expect(400)
                .end(done);
        });
    });

    // The subgroup of PATCH '/favorite-recipes/delete/:id' API.
    describe('Delete Favorite Recipe API Test', () => {
        it('should delete a favorite recipe', done => {
            const recipe = init_recipes[0];
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/delete/' + recipe.id)
                .set({ Authorization: 'bearer ' + token })
                .expect(200)
                .expect(res => {
                    FavRecipe.findOne({ userId: init_user.id }, (err, favRecipe) => {
                        expect(favRecipe.favRecipes.length).toBe(0);
                    })
                })
                .end(done);
        });

        it('should not delete a recipe from favorites if it is not in there', done => {
            const recipe = init_recipes[1];
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/delete/' + recipe.id)
                .set({ Authorization: 'bearer ' + token })
                .expect(200)
                .expect(res => {
                    FavRecipe.findOne({ userId: init_user.id }, (err, favRecipe) => {
                        expect(favRecipe.favRecipes.length).toBe(1);
                    })
                })
                .end(done);
        });

        it('should return an error of status 401 if no token is provided in the header', done => {
            request(app)
                .patch('/favorite-recipes/delete/' + init_recipes[1].id)
                .expect(401)
                .end(done);
        });

        it('should return an error of status 401 if token format is not correct', done => {
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/delete/' + init_recipes[1].id)
                .set({ Authoriztion: token })
                .expect(401)
                .end(done);
        });

        it('should return an error of status 401 if an unauthorized token is provided', done => {
            fakeToken = '12345abcde';
            request(app)
                .patch('/favorite-recipes/delete/' + init_recipes[1].id)
                .set({ Authorization: 'bearer ' + fakeToken })
                .expect(401)
                .end(done);
        });

        it('should return an error of status 400 if the provided recipe id is invalid', done => {
            const fakeId = "12345abcde";
            const token = jwt.sign({ id: init_user.id }, SECRET_KEY, { expiresIn: '10h' });
            request(app)
                .patch('/favorite-recipes/delete/' + fakeId)
                .set({ Authorization: 'bearer ' + token })
                .expect(400)
                .end(done);
        });

    });
});

// The test group of image APIs.
describe('Image API Test', () => {
    it('should fetch an image', done => {
        Image.find({}, (err, images) => {
            request(app)
                .get('/image/' + images[0].id)
                .expect(200)
                .end(done);
        })
    });
});