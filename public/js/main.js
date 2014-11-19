$(document).ready(function(){

	renderPage();

	function renderPage(){
			$.getJSON( "/api/get/topics", function(data) {
				$.each(data.teach, function(index) {
          var posClass = randomizePos();
          var rotClass = randomizeRot();
          var sizeClass = randomizeSize();
          var fontClass = randomizeFont();
	        $('#teach').append(
	          '<div class="topic-holder col-md-2 '+posClass+' '+rotClass+' '+sizeClass+'" id="'+data.teach[index]._id+'">' +
	          	'<p class="headings '+fontClass+'">'+data.teach[index].description+ '</p>' +
              '<p class="vote-count">'+data.teach[index].voteCount+' votes &nbsp (Text "Vote ' +data.teach[index].voteCode+'")</p>' +
	        	'</div>'				  
	        );
	      });
				$.each(data.learn, function(index) {
          var posClass = randomizePos();
          var rotClass = randomizeRot();
          var sizeClass = randomizeSize();
          var fontClass = randomizeFont();          
	        $('#learn').append(
            '<div class="topic-holder col-md-2 '+posClass+' '+rotClass+' '+sizeClass+'" id="'+data.learn[index]._id+'">' +
	          	'<p class="headings '+fontClass+'">'+data.learn[index].description+'</p>' +
	          	'<p class="vote-count">'+data.learn[index].voteCount+' votes &nbsp (Text "Vote ' +data.learn[index].voteCode+'")</p>' +
	        	'</div>'				  
	        );
	      });					
			});
		}
});

function randomizePos(){
  var classList = ['pullLeft','pullRight','pullUp','pullDown'];
  var ran = Math.floor((Math.random() * (classList.length)) + 0);;
  return classList[ran];
}

function randomizeRot(){
  var classList = ['rotCW','rotCC'];
  var ran = Math.floor((Math.random() * (classList.length)) + 0);;
  return classList[ran];    
}

function randomizeSize(){
  var classList = ['shrink90','shrink80',''];
  var ran = Math.floor((Math.random() * (classList.length)) + 0);;
  return classList[ran];   
}

function randomizeFont(){
  var classList = ['hand','sketch_chalk','handlee','patrickhand','gochihand','patrickhand2'];
  var ran = Math.floor((Math.random() * (classList.length)) + 0);;
  return classList[ran];    
}

// local --> http://localhost:5000/
// server --> https://itp-jan-jam.herokuapp.com/
var socket = io('https://itp-unconference.herokuapp.com');
socket.on('connect', function () {
	console.log('connected');
});

socket.on('twilioData', function (data) {
  switch(data.key){
  	case 'teach':
  		//render teach data
  		//console.log(data.topic)
      var posClass = randomizePos();
      var rotClass = randomizeRot();
      var sizeClass = randomizeSize();
      var fontClass = randomizeFont();      
      $('#teach').prepend(
        '<div class="topic-holder col-md-2 '+posClass+' '+rotClass+' '+sizeClass+'" id="'+data.topic._id+'">' +
          '<p class="headings '+fontClass+'">'+data.topic.description+ '</p>' +
          '<p class="vote-count">'+data.topic.voteCount+' votes &nbsp (Text "Vote ' +data.topic.voteCode+'")</p>' +
      	'</div>'				  
      );
      //animate
      $teach = $('#teach').find('#'+data.topic._id);
      $heading = $($teach).find('.headings'),
      $vc = $($teach).find('.vote-count'),
      mySplitHeading = new SplitText($heading, {type:"chars, words"}),
      mySplitVC = new SplitText($vc, {type:"chars, words"}),
      //mySplitV = new SplitText($v, {type:"chars, words"}),
      tl = new TimelineLite({delay:1}),
      tl.add("test", "+=5");
      numHChars = mySplitHeading.chars.length;
      numVCChars = mySplitVC.chars.length;
      numVChars = mySplitV.chars.length;
      console.log(numHChars);
      for(var i = 0; i < numHChars; i++){
        tl.from(mySplitHeading.chars[i], 2, {z:randomNumber(-500,300), opacity:0, rotationY:randomNumber(-40, 40)}, i*.2);
      }

      for(var i = 0; i < numVCChars; i++){
        tl.from(mySplitVC.chars[i], 2, {z:randomNumber(-500,300), opacity:0, rotationY:randomNumber(-40, 40)}, numHChars*.2+i*.2);
      }

      for(var i = 0; i < numVChars; i++){
        tl.from(mySplitV.chars[i], 2, {z:randomNumber(-500,300), opacity:0, rotationY:randomNumber(-40, 40)}, numHChars*.2 + numHChars*.2 +i*.5);
      }      		
  		break;
  	case 'learn':
  		//render teach data
      var posClass = randomizePos();
      var rotClass = randomizeRot();
      var sizeClass = randomizeSize();
      var fontClass = randomizeFont();     
      $('#learn').prepend(
        '<div class="topic-holder col-md-2 '+posClass+' '+rotClass+' '+sizeClass+'" id="'+data.topic._id+'">' +
        	'<p class="headings '+fontClass+'">'+data.topic.description+'</p>' +
          '<p class="vote-count">'+data.topic.voteCount+' votes &nbsp (Text "Vote ' +data.topic.voteCode+'"")</p>' +
      	'</div>'				  
      );          		
  		break;
  	// case 'name':
  	// 	//render teach data
  	// 	$("#"+data.topic._id+" .session-leader").text('with ' +data.topic.person.name);
  	// 	$("#"+data.topic._id+" .session-leader").show();
  	// 	break;  		
  	case 'vote':
  		//render teach data
  		$("#"+data.topic._id+" .vote-count").html(data.topic.voteCount+' votes &nbsp (Text "Vote ' +data.topic.voteCode+'")');
  		break;
  	default:
  		console.log('invalid twilio socket event');	  		  		
  }   
});