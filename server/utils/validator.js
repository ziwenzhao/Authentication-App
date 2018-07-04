/**
 * @description This file is used to export validator functions
 */
const { EMAIL_REGEX } = require('../config/regex');
const emailValidator = email => EMAIL_REGEX.test(email)
const passwordValidator = password => {
    if (!password) {
        return false;
    }
    if (password.length < 6) {
        return false;
    }
    return true;
}
module.exports = { emailValidator, passwordValidator };