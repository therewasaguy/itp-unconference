$(document).ready(function(){

	renderPage();

	function renderPage(){
			$.getJSON( "/api/get/topics", function(data) {
				$.each(data.teach, function(index) {
	        $('#teach').append(
	          '<div class="topic-holder col-md-4" id="'+data.teach[index]._id+'">' +
	          	'<p class="headings">'+data.teach[index].description+ ' ' +
	          	(data.teach[index].person.name ?'<span class="session-leader">with ' +data.teach[index].person.name+'</p>' : '<span class="session-leader" style="display:none"></span>') +
              '</p>' +
              '<p class="vote-count">'+data.teach[index].voteCount+' votes (Text "Vote ' +data.teach[index].voteCode+'")</p>' +
	        	'</div>'				  
	        );
	      });
				$.each(data.learn, function(index) {
	        $('#learn').append(
	          '<div class="topic-holder col-md-4" id="'+data.learn[index]._id+'">' +
	          	'<p class="headings">'+data.learn[index].description+'</p>' +
	          	'<p class="vote-count">'+data.learn[index].voteCount+' votes (Text "Vote ' +data.learn[index].voteCode+'")</p>' +
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
        '<div class="topic-holder col-md-4" id="'+data.topic._id+'">' +
          '<p class="headings">'+data.topic.description+ ' ' +
          (data.topic.person.name ?'<span class="session-leader">with ' +data.topic.person.name+'</p>' : '<span class="session-leader" style="display:none"></span>') +
          '</p>' +
          '<p class="vote-count">'+data.topic.voteCount+' votes (Text "Vote ' +data.topic.voteCode+'")</p>' +
      	'</div>'				  
      );  		
  		break;
  	case 'learn':
  		//render teach data
  		console.log(data.topic)
      $('#learn').append(
        '<div class="topic-holder col-md-4" id="'+data.topic._id+'">' +
        	'<p class="headings">'+data.topic.description+'</p>' +
          '<p class="vote-count">'+data.topic.voteCount+' votes (Text "Vote ' +data.topic.voteCode+'"")</p>' +
      	'</div>'				  
      );    		
  		break;
  	case 'name':
  		//render teach data
  		console.log(data.topic)
  		$("#"+data.topic._id+" .session-leader").text('with ' +data.topic.person.name);
  		$("#"+data.topic._id+" .session-leader").show();
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