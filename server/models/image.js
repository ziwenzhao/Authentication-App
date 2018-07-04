/**
 * @description This file is used to export the mongoose model of Image.
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageSchema = new Schema({
    data: Buffer,
    contentType: String
});
const Image = mongoose.model('Image', imageSchema);

module.exports = Image;