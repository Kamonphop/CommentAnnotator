var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;

//load related model
var Schema = mongoose.Schema;

// define the schema for our amazon label model
var productSchema = new Schema({
    asin : String,
    shortname : String
});

module.exports = mongoose.model('Product', productSchema);
