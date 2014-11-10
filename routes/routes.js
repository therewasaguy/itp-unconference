
/*
 * routes/routes.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */

var http = require('http');
var request = require('request'); // library to make requests to remote urls
var Q = require('q'); // library for javascript promises
var moment = require("moment"); // date manipulation library
var Model = require("../models/model.js"); //db model... call like Model.Topic

//Twilio
var twilio = require('twilio');

/*
	GET /
*/
exports.index = function(req, res) {
	
	console.log("main page requested");

		//build and render template
		var viewData = {
			pageTitle : "ITP January"
		}

		res.render('index.html', viewData);

}

exports.twilioCallback =  function(req,res){

	var newMsg = req.body.Body;
	var twilioResp = new twilio.TwimlResponse();

	// let's get the first word, so we know which action they are doing
	// can be teach, learn, or vote
	var re = new RegExp("^([\w\-]+)");
	var action = re.exec(newMsg);
	console.log('action is ' + action);

  twilioResp.sms('Thanks, your message of "' + newMsg + '" was received!');

  res.set('Content-Type', 'text/xml');
  res.send(twilioResp.toString());
}
