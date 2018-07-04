/**
 * @description This file is used to export the mongoose model of User. 
 *              The model will hash the field of password each time before saving and searching.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { emailValidator } = require('../utils/validator');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: emailValidator,
            message: 'Email is not in a correct form!'
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6
    }
});


userSchema.pre('save', function (next) {
    const user = this;
    hashPassword(user, next);
});
userSchema.pre('findOne', function (next) {
    const user = this;
    if (user.password) {
        hashPassword(user.password, next);
    } else {
        next();
    }
})
userSchema.pre('find', function (next) {
    const user = this;
    if (user.password) {
        hashPassword(user.password, next);
    } else {
        next();
    }
})

function hashPassword(user, next) {
    bcrypt.hash(user.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
}
const User = mongoose.model('User', userSchema);

module.exports = User;