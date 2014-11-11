$(document).ready(function(){

	renderPage();

	function renderPage(){
			$.getJSON( "/api/get/topics", function(data) {
				console.log(data); // comes in as a data object with 2 arrays, 'teach' and 'learn'
				$.each(data.teach, function(index) {
				  console.log(data.teach[index]);
	        $('#teach').append(
	          '<div class="topic-holder" id="'+data.teach[index]._id+'">' +
	          	'<p>Topic: ' +data.teach[index].description+'</p>' +
	          	'<p>Session Leader: ' +data.teach[index].person+'</p>' +
	          	'<p>Current Vote Count: ' +data.teach[index].voteCount+'</p>' +
	          	'<p>Vote for this topic by texting "Vote ' +data.teach[index].voteCode+'"</p>' +
	        	'</div>'				  
	        );
	      });
				$.each(data.learn, function(index) {
				  console.log(data.learn[index])
	        $('#learn').append(
	          '<div class="topic-holder" id="'+data.learn[index]._id+'">' +
	          	'<p>Topic: ' +data.learn[index].description+'</p>' +
	          	'<p>Current Vote Count: ' +data.learn[index].voteCount+'</p>' +
	          	'<p>Vote for this topic by texting "Vote ' +data.learn[index].voteCode+'"</p>' +
	        	'</div>'				  
	        );
	      });					
			});
		}
});

var socket = io('http://itp-jan-jam.herokuapp.com/');
socket.on('connect', function () {
	console.log('connected');
});

socket.on('twilioData', function (data) {
  console.log(data);
  //socket.emit('my other event', { my: 'data' });
});