
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

	var newMsg = req.body.body;
	console.log(req);
	console.log(newMsg);
	var twilioResp = new twilio.TwimlResponse();

  twilioResp.sms('Thanks, your message of "' + newMsg + '" was received!');

  res.set('Content-Type', 'text/xml');
  res.send(twilioResp.toString());
}
