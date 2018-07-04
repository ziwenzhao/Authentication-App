/**
 * @description The main file of server. It defines all the REST APIs.
 */
const express = require('express');
const bodyParser = require('body-parser'); // Used to parse body from request
const jwt = require('jsonwebtoken');  // Used to sign and verify token
const mongoose = require('./db/mongoose');
const cors = require('cors');  // Used to solve the Cross-Origin Resource Sharing issues in the browser
const bcrypt = require('bcrypt');  // Used to hash password
const User = require('./models/user');
const { Recipe, FavRecipe } = require('./models/recipe');
const Image = require('./models/image');
const { SECRET_KEY } = require('./config/auth');  // Used to sign token
const { EMAIL_REGEX } = require('./config/regex');
const app = express();
const port = process.env.PORT || 5000;  // Set listening port accoring to environment
app.use(bodyParser.json());
app.use(cors());


app.post('/signup', verifyEmailAndPassword, (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (user) {
            return res.status(409).send({ message: 'This email already exists!' })
        }
        const newUser = new User({
            email: req.body.email,
            password: req.body.password
        });
        newUser.save((err, user) => {
            if (err) {
                return res.status(400).send(err);
            }
            const token = signToken(user.id)
            res.send({
                id: user.id,
                email: user.email,
                token
            });
        });
    });
})

app.post('/signin', verifyEmailAndPassword, (req, res) => {
    User.findOne({ email: req.body.email }, async (err, user) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!user) {
            return res.status(404).send({ message: 'This user does not exist!' })
        }
        const result = await bcrypt.compare(req.body.password, user.password).catch(e => console.log('compare error is ', e));
        if (!result) {
            return res.status(401).send({ message: 'Password is not correct!' });
        }
        const token = signToken(user.id);
        res.send({
            id: user.id,
            email: user.email,
            token
        })
    })
})

app.get('/refresh-token', verifyToken, (req, res) => {
    res.send({ token: signToken(req.userId) });
})

app.get('/recipes', (req, res) => {
    Recipe.find((err, recipes) => {
        if (err) {
            return res.status(400).send(err);
        }
        res.send(recipes);
    })
})

app.get('/favorite-recipes', verifyToken, (req, res) => {
    FavRecipe.findOne({ userId: req.userId }, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!result) {
            return res.send([]);
        }
        res.send(result.favRecipes);
    });
})

app.patch('/favorite-recipes/add/:id', verifyToken, verifyRecipeId, (req, res) => {
    FavRecipe.findOne({ userId: req.userId }, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!result) {
            const favRecipe = new FavRecipe({
                userId: req.userId,
                favRecipes: [req.recipe]
            });
            favRecipe.save((err, favRecipe) => {
                if (err) {
                    return status(400).send(err);
                }
                res.send({ message: 'Added a favorite recipe!' })
            });
        } else {
            if (result.favRecipes.find(recipe => recipe.id === req.recipe.id)) {
                return res.send({ message: 'The recipe has already been added to favorites.' });
            }
            result.favRecipes.push(req.recipe);
            result.save((err, favRecipe) => {
                if (err) {
                    return status(400).send(err);
                }
                res.send({ message: 'Added a favorite recipe!' });
            })
        }
    })
})

app.patch('/favorite-recipes/delete/:id', verifyToken, verifyRecipeId, (req, res) => {
    FavRecipe.findOne({ userId: req.userId }, (err, result) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!result) {
            return res.send({ message: 'The user does not have favorite recipes!' });
        }
        const idx = result.favRecipes.findIndex(recipe => recipe.id === req.recipe.id);
        if (idx === -1) {
            return res.send({ message: 'The user does not have this favorite recipe!' });
        }
        result.favRecipes.splice(idx, 1);
        result.save((err, favRecipe) => {
            if (err) {
                return res.status(400).send(err);
            }
            res.send({ message: 'Favorite recipe deleted!' });
        })
    })
})

app.get('/image/:id', (req, res) => {
    Image.findById(req.params.id, (err, image) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!image) {
            return res.status(404).send({ message: 'Image cannot be found!' });
        }
        res.contentType(image.contentType);
        res.send(image.data);
    })
})

/**
 * It checks the validation of email and password. 
 * Email should be in a correct email form and the lengh of password cannot be less than 6.
 * @param req 
 * @param res 
 * @param next 
 */
function verifyEmailAndPassword(req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(422).send({ message: 'Email and password canot be empty!' });
    }
    let error = {};
    if (!EMAIL_REGEX.test(req.body.email)) {
        error.email = 'The form of email is incorrect!'
    }
    if (req.body.password.length < 6) {
        error.password = 'The minimum length of password should be 6.'
    }
    if (Object.keys(error).length !== 0) {
        return res.status(422).send({ error });
    }
    next();
}

/**
 * It checks the validation of recipe Id provided in the request path parameter.
 * If it finds the recipe corresponded to the Id, it will attach the recipe in reqeust.
 * @param req 
 * @param res 
 * @param next 
 */
function verifyRecipeId(req, res, next) {
    if (!req.params.id) {
        return res.status(422).send({ message: 'A path parameter of id should be provided!' });
    }
    Recipe.findById(req.params.id, (err, recipe) => {
        if (err) {
            return res.status(400).send({ message: err.message });
        }
        if (!recipe) {
            return res.status(404).send({ message: 'The recipe id does not exist!' });
        }
        req.recipe = recipe;
        next();
    })
}

/**
 * It signs a token with the given userId. The secret key is hidden in the heroku environment variables.
 * @param userId 
 */
function signToken(userId) {
    return jwt.sign(
        { id: userId },
        process.env.SECRET_KEY || SECRET_KEY,
        { expiresIn: '10h' }
    );
}

/**
 * It verifies the provided token in the header. 
 * If it decodes a existing user, it will attach the userId in the request
 * @param req 
 * @param res 
 * @param next 
 */
function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (!bearerHeader) {
        return res.status(401).send({ message: 'Authorization in header is missed!' })
    }
    if (bearerHeader.split(' ')[0] !== 'bearer' || bearerHeader.split(' ').length !== 2) {
        return res.status(401).send({ message: 'Token format in header is incorrect!' })
    }
    let payload = {};
    try {
        payload = jwt.verify(bearerHeader.split(' ')[1], process.env.SECRET_KEY || SECRET_KEY);
    } catch (err) {
        return res.status(401).send({ message: err.message });
    }
    if (!payload.id) {
        return res.status(401).send({ message: 'Unauthorized token!' });
    }
    User.findById(payload.id, (err, user) => {
        if (err) {
            return res.status(400).send(err);
        }
        if (!user) {
            return res.status(401).send({ message: 'Unauthorized token!' });
        }
        req.userId = user.id;
        next();
    })
}

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
});

module.exports = app;



