var moment = require('moment');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// define a schema
var TopicSchema = new Schema({
	description: String,
	type: {type:String, enum:'teach learn'.split(' ')},
	voteCode: String,
	voteCount: Number,
	person: String, // if proposing to teach it, we need their name
  dateAdded: {type: Date, default: moment}
});


// export model
module.exports = mongoose.model('Topic',TopicSchema);