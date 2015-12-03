
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose-q')(require('mongoose')); // convenience methods for Q with mongoose. see https://github.com/iolo/mongoose-q

// the ExpressJS App
var app = express();

// for testing
if (!process.env.TWILIO_AUTH_TOKEN) {
  require('dotenv').load();
}

// configuration of port, templates (/views), static files (/public)
// and other expressjs settings for the web server.
app.configure(function(){

  // server port number
  app.set('port', process.env.PORT || 5000);

  //  templates directory to 'views'
  app.set('views', __dirname + '/views');

  // setup template engine - we're using Hogan-Express
  app.set('view engine', 'html');
  app.set('layout','layout');
  app.engine('html', require('hogan-express')); // https://github.com/vol4ok/hogan-express

  app.use(express.favicon());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

  // database connection
  app.db = mongoose.connect(process.env.MONGOLAB_URI);
  console.log("connected to database");
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/**
 * CORS support.
 */

app.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'PUT');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

// ROUTES

app.get('/', index);
app.get('/teach', teach);
app.get('/learn', learn);
app.get('/api/get/topics',getData);
app.post('/twilio-callback',twilioCallback);

// create NodeJS HTTP server using 'app'
var server = require('http').createServer(app);

// set up sockets
var io = require('socket.io')(server);

io.on('connection', function(socket){
  socket.on('disconnect', function(){
  });
});

/*
 * 
 * Routes contains the functions (callbacks) associated with the above request urls.
 */

var Q = require('q'); // library for javascript promises
var moment = require("moment"); // date manipulation library
var Topic = require("./models/model.js"); //db model... call like Model.Topic

//Twilio
var twilio = require('twilio');

function index (req, res) {
  
    //build and render template
    var viewData = {
      pageTitle : "ITP January"
    }

    res.render('index.html', viewData);

}


function teach (req, res) {
  
    //build and render template
    var viewData = {
      pageTitle : "TEACH | ITP January"
    }

    res.render('teach.html', viewData);

}


function learn (req, res) {
  
    //build and render template
    var viewData = {
      pageTitle : "LEARN | ITP January"
    }

    res.render('learn.html', viewData);

}

function getData (req,res){

  var data = {}; // data to respond back with
  Topic.find({'type':'teach'}).sort('-dateAdded').execQ()
  .then(function(response){
    data['teach'] = response;
    return Topic.find({'type':'learn'}).sort('-dateAdded').execQ()
  }) 
  .then(function(response){
    data['learn'] = response;
    return res.json(data);
  }) 
  .fail(function (err) { console.log(err); })
  .done(); 

}

function twilioCallback (req,res){

  var newMsg = req.body.Body;
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
        handleTwilioMessage('teach',msgToRelay);
        break;
      case 'learn':
        handleTwilioMessage('learn',msgToRelay);
        break;
      case 'vote':
        handleTwilioMessage('vote',msgToRelay);
        break;
      case 'name':
        handleTwilioMessage('name',msgToRelay);
        break;
      default:
        respondBackToTwilio('default');
     }

  //function does 3 things 
  // 1. saves the data to db
  // 2. calls function to emit it to front-end via sockets
  // 3. responds back to twilio

  function handleTwilioMessage(key,msg){
    switch(key) {
      case 'teach':
       var dataToSave = {
        description: msg,
        type: 'teach',
        voteCount: 1,
        person: {phoneNumber: req.body.From},
        voteCode: generateVoteCode()
       }
       // save to db;
       var topic = Topic(dataToSave);         
        topic.saveQ()
        .then(function (response){
          conversationId = response._id;
          conversationId = conversationId.toString();
          emitSocketMsg('teach',response);
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
          emitSocketMsg('learn',response);
          respondBackToTwilio('learn');
        })
        .fail(function (err) { console.log(err); })
        .done();    
        break;
      case 'vote':
        // increment the vote in the db and then let the front-end know
        var emitNewData = true; // should we emit the data to front-end? becomes false if error hit
        Topic.findOneQ({'voteCode':msg})
        .then(function(response){
          if(response == null) {
            emitNewData = false;
            return respondBackToTwilio('vote-fail');
          }
          else { 
            var newVoteCount = response.voteCount + 1;
            var topicId = response._id;
            return Topic.findByIdAndUpdateQ(topicId,{'voteCount':newVoteCount})
          }
        })
        .then(function(response){
          if(emitNewData){
            msgToRelay = response.description; // change the reponsse msg to the topic
            emitSocketMsg('vote',response);
            respondBackToTwilio('vote');
          }
          else return;
        }) 
        .fail(function (err) { console.log(err); })
        .done();       
        break; 
      case 'name':
        // add the user's name for the topic they want to teach
        var dataToSave = {person: {name:msg,phoneNumber: req.body.From}}
        var topicId = req.cookies.conversation; // we store the topicId in the conversation cookie
        Topic.findByIdAndUpdateQ(topicId,dataToSave)
        .then(function(response){
          if(response == null) return respondBackToTwilio('name-fail');
          else { 
            //emitSocketMsg('name',response);
            return respondBackToTwilio('name');
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
    var possible = "abcdefghjkmnpqrstuvwxyz23456789";
    for(var i=0;i<3;i++)
      code += possible.charAt(Math.floor(Math.random() * possible.length));   
    return code;
  }

  function respondBackToTwilio(key){

    var twilioResp = new twilio.TwimlResponse();

    switch(key) {
      case 'teach':
        twilioResp.sms('Awesome! We have noted that you want to teach ' + msgToRelay +'. One more step, please respond with your name. Start your next message with the word Name, like Name Dan Shiffman');
        res.cookie('conversation',conversationId);
        break;
      case 'learn':
        twilioResp.sms('Sweet! We have noted that you want to learn ' + msgToRelay);
        break;
      case 'vote':
        twilioResp.sms('Oh cool! We have noted your vote for the topic "' + msgToRelay+'"');
        break;
      case 'vote-fail':
        twilioResp.sms('Oops! Could not find that vote code ('+msgToRelay+') :( Try again');
        break;
      case 'name':
        twilioResp.sms('Thanks ' + msgToRelay + '! We have noted your name and all that.');
        break;
      case 'name-fail':
        twilioResp.sms('Oops! Could not find any topic for you :( Email slover@nyu.edu with your name and session.');
        break;                  
      default:
        twilioResp.sms('We got your message, but you need to start it with either teach, learn, vote, or name!');
      }
    res.set('Content-Type', 'text/xml');
    res.send(twilioResp.toString());    
  }

  function emitSocketMsg(key,data){
    var dataToRelay = {key:key,topic:data};
    io.sockets.emit('twilioData',dataToRelay);
  }
}

// listen 
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
}); 