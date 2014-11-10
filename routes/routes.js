
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
	
		//build and render template
		var viewData = {
			pageTitle : "ITP January"
		}

		res.render('index.html', viewData);

}

exports.getData = function(req,res){

	var data = {}; // data to respond back with

	Topic.findQ({'type':'teach'})
	.then(function(response){
		data['teach'] = response;
		return Topic.findQ({'type':'learn'})
	}) 
	.then(function(response){
		data['learn'] = response;
		return res.json(data);
	}) 
	.fail(function (err) { console.log(err); })
	.done(); 

}

exports.twilioCallback =  function(req,res){

	var newMsg = req.body.Body;
	console.log(req);
	var conversationId; // an id to track the conversation, will be the mongoDb id

	// let's get the first word, so we know which action they are doing
	// can be teach, learn, or vote
	var words = newMsg.split(" ");
	var action = words[0].toLowerCase();
	var msgToRelay = ''; // all the stuff after the action word
	for(var i=0;i<words.length;i++){
		if(i==0) continue;
		msgToRelay += words[i];
		if(i!=words.length-1) msgToRelay += ' ';
	}

	switch(action) {
	    case 'teach':
        updateDb('teach',msgToRelay);
        //emitSocketMsg('teach',msgToRelay);
        break;
	    case 'learn':
        updateDb('learn',msgToRelay);
        //emitSocketMsg('learn',msgToRelay);	       
        break;
	    case 'vote':
        updateDb('vote',msgToRelay);
        //emitSocketMsg('vote',msgToRelay);	        
        break;
      case 'name':
      	updateDb('name',msgToRelay);
      	//emitSocketMsg('vote',msgToRelay);
	    default:
	    	respondBackToTwilio('default');
	   }

	function updateDb(key,msg){
		switch(key) {
	    case 'teach':
	     var dataToSave = {
	     	description: msg,
	     	type: 'teach',
	     	voteCount: 1,
	     	voteCode: generateVoteCode()
	     }
	     // save to db;
	     var topic = Topic(dataToSave);		    	
	    	topic.saveQ()
	    	.then(function (response){
	    		conversationId = _id;
	    		console.log(response);
	    		respondBackToTwilio('teach');
				})
				.fail(function (err) { console.log(err); })
				.done(); 
        break;

	    case 'learn':
	     var dataToSave = {
	     	description: msg,
	     	type: 'learn',
	     	voteCount: 1,
	     	voteCode: generateVoteCode()
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
	    		if(response == null) return respondBackToTwilio('vote-fail');
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

	function generateVoteCode(){
		var code = '';
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for(var i=0;i<3;i++)
			code += possible.charAt(Math.floor(Math.random() * possible.length));		
		return code;
	}

	function respondBackToTwilio(key){

		var twilioResp = new twilio.TwimlResponse();

		switch(key) {
	    case 'teach':
        twilioResp.sms('Awesome! We have noted that you want to teach ' + msgToRelay +'. One more step, please respond with your name.');
        res.cookie('conversation',conversationId);
        break;
	    case 'learn':
        twilioResp.sms('Sweet! We have noted that you want to learn ' + msgToRelay);
        break;
	    case 'vote':
	    	twilioResp.sms('Oh cool! We have noted your vote for ' + msgToRelay);
	    	break;
	    case 'vote-fail':
	    	twilioResp.sms('Oops! Could not find that vote code ('+msgToRelay+') :( Try again');
	    	break;	    	
	    default:
	      twilioResp.sms('We got your message, but you need to start it with either teach, learn or vote!');
	  	}
		res.set('Content-Type', 'text/xml');
  	res.send(twilioResp.toString());		
	}
}
