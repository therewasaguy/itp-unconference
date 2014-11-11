$(document).ready(function(){

	renderPage();

	function renderPage(){
			$.getJSON( "/api/get/topics", function(data) {
				$.each(data.teach, function(index) {
	        $('#teach').append(
	          '<div class="topic-holder" id="'+data.teach[index]._id+'">' +
	          	'<p>Topic: ' +data.teach[index].description+'</p>' +
	          	'<p>Session Leader: ' +data.teach[index].person+'</p>' +
	          	'<p class="vote-count">Current Vote Count: ' +data.teach[index].voteCount+'</p>' +
	          	'<p>Vote for this topic by texting "Vote ' +data.teach[index].voteCode+'"</p>' +
	        	'</div>'				  
	        );
	      });
				$.each(data.learn, function(index) {
	        $('#learn').append(
	          '<div class="topic-holder" id="'+data.learn[index]._id+'">' +
	          	'<p>Topic: ' +data.learn[index].description+'</p>' +
	          	'<p class="vote-count">Current Vote Count: ' +data.learn[index].voteCount+'</p>' +
	          	'<p>Vote for this topic by texting "Vote ' +data.learn[index].voteCode+'"</p>' +
	        	'</div>'				  
	        );
	      });					
			});
		}
});

// local --> http://localhost:5000/
// server --> http://itp-jan-jam.herokuapp.com/
var socket = io('http://itp-jan-jam.herokuapp.com/');
socket.on('connect', function () {
	console.log('connected');
});

socket.on('twilioData', function (data) {
  switch(data.key){
  	case 'teach':
  		//render teach data
  		console.log(data.topic)
      $('#teach').append(
        '<div class="topic-holder" id="'+data.topic._id+'">' +
        	'<p>Topic: ' +data.topic.description+'</p>' +
        	'<p>Session Leader: ' +data.topic.person+'</p>' +
        	'<p class="vote-count">Current Vote Count: ' +data.topic.voteCount+'</p>' +
        	'<p>Vote for this topic by texting "Vote ' +data.topic.voteCode+'"</p>' +
      	'</div>'				  
      );  		
  		break;
  	case 'learn':
  		//render teach data
  		console.log(data.topic)
      $('#learn').append(
        '<div class="topic-holder" id="'+data.topic._id+'">' +
        	'<p>Topic: ' +data.topic.description+'</p>' +
        	'<p class="vote-count">Current Vote Count: ' +data.topic.voteCount+'</p>' +
        	'<p>Vote for this topic by texting "Vote ' +data.topic.voteCode+'"</p>' +
      	'</div>'				  
      );    		
  		break;
  	case 'vote':
  		//render teach data
  		console.log(data.topic)
  		$("#"+data.topic._id+" .vote-count").text('Current Vote Count: ' +data.topic.voteCount);

  		break;
  	default:
  		console.log('invalid twilio socket event');	  		  		
  }
});