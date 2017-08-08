// var _html = $( "#testpre" ).text();

// var lines = _html.split('\n');

//when the highlight is loaded
$(function() {
    var local_data = !{JSON.stringify(srcCodeContent)};
    console.log(local_data);
    console.log( "ready!" );
    var comments = $(".comment");
    console.log(comments.length);
    var total = comments.length;
    $('#testclick').on('click', function (e) {
    	var randomnumber = Math.floor(Math.random() * (total + 1)) + 0;
    	var commentID = "#comment_"+randomnumber;
    	$(".comment").css("background-color","transparent");
    	$(commentID).css("background-color","rgba(255,255,0,0.3)");
    	var ID = "comment_"+randomnumber;
    	var target = document.getElementById(ID);
    	$('#testpre').scrollTop(target.offsetTop-10);
    	var comment = $(commentID).text();
    	$("#comment_show").text(comment);
    	window.scrollBy(0, -10);
	});
});