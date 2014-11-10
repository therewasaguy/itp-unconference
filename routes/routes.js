
/*
 * routes/routes.js
 * 
 * Routes contains the functions (callbacks) associated with request urls.
 */

var http = require('http');
var request = require('request'); // library to make requests to remote urls
var Q = require('q'); // library for javascript promises
var moment = require("moment"); // date manipulation library
var Topic = require("../models/model.js"); //db model... call like Model.Topic

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

	// let's get the first word, so we know which action they are doing
	// can be teach, learn, or vote
	var words = newMsg.split(" ");
	var action = words[0].toLowerCase();
	var msgToSave = ''; // all the stuff after the action word
	for(var i=0;i<words.length;i++){
		if(i==0) continue;
		msgToSave += words[i];
		if(i!=words.length-1) msgToSave += ' ';
	}
	

  var twilioResp = new twilio.TwimlResponse();

	switch(action) {
	    case 'teach':
	        twilioResp.sms('Awesome! We have noted that you want to teach ' + msgToSave);
	        saveToDb('teach',msgToSave);
	        //emitSocketMsg('teach',msgToSave);
	        break;
	    case 'learn':
	       twilioResp.sms('Sweet! We have noted that you want to learn ' + msgToSave);
	        saveToDb('learn',msgToSave);
	        //emitSocketMsg('learn',msgToSave);	       
	        break;
	    case 'vote':
	        twilioResp.sms('Oh cool! We have noted your vote for ' + msgToSave);
	        saveToDb('vote',msgToSave);
	        //emitSocketMsg('learn',msgToSave);	        
	        break;	        
	    default:
	        twilioResp.sms('We got your message, but you need to start it with either teach, learn or vote!');
	}

	function saveToDb(key,msg){
		switch(key) {
	    case 'teach':
	     var dataToSave = {
	     	description: msg,
	     	type: 'teach',
	     	voteCount: 1,
	     	voteCode: generateCode()
	     }
	     // save to db;
	     var topic = Topic(dataToSave);		    	
	    	topic.saveQ()
	    	.then(function (response){ 
	    		console.log(response);
				})
				.fail(function (err) { console.log(err); })
				.done(); 
        break;

	    case 'learn':
	     var dataToSave = {
	     	description: msg,
	     	type: 'learn',
	     	voteCount: 1,
	     	voteCode: generateCode()
	     }
	     // save to db;
	     var topic = new Topic(dataToSave);		    	
	    	topic.saveQ()
	    	.then(function (response){ 
	    		console.log(response);
				})
				.fail(function (err) { console.log(err); })
				.done();    
        break;
	    case 'vote':
	    	// handle this differently
	    	Topic.findOneQ({'voteCode':msg})
	    	.then(function(response){
	    		console.log(response);
	    		if(response == 'null') return;
	    		else { 
	    			var newVoteCount = response.voteCount + 1;
	    			var topicId = response._id;
	    			return Topic.findByIdAndUpdateQ(topicId,{'voteCount':newVoteCount})
	    		}
	    	}) 
	    	.fail(function (err) { console.log(err); })
				.done();       
        break;	        
	    default:
	      res.status(500).send({error:'Oops, something went wrong.'});
		}		
	}		

	function generateCode(){
		var code = '';
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for(var i=0;i<3;i++)
			code += possible.charAt(Math.floor(Math.random() * possible.length));		
		return code;
	}

  //res.set('Content-Type', 'text/xml');
  //res.send(twilioResp.toString());
}
