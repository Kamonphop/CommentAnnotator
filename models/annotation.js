var mongoose = require('mongoose');

mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;

var annotationSchema = mongoose.Schema({
    annotated : [{
        _src : { type: Schema.Types.ObjectId, ref: 'Comment' },
        _comment : { type: Schema.Types.ObjectId, ref: 'Comment' },
        label: { type: String, 'default': 'undecided' }
    }]
});

module.exports = mongoose.model('Annotation', annotationSchema);
