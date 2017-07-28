var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

var commentSchema = mongoose.Schema({
    text : String,
    category: String
});

module.exports = mongoose.model('Comment', commentSchema);
