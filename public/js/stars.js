$.fn.stars = function() {
	return $(this).each(function() {

		var rating = $(this).data("rating");

		var numStars = $(this).data("numStars");

		var fullStar = new Array(Math.floor(rating + 1)).join('<i class="fa fa-star"></i>');

		var halfStar = ((rating%1) !== 0) ? '<i class="fa fa-star-half-empty"></i>': '';

		var noStar = new Array(Math.floor(numStars + 1 - rating)).join('<i class="fa fa-star-o"></i>');

		$(this).html(fullStar + halfStar + noStar);

	});
}

$('.stars').stars();