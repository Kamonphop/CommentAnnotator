num_sentence = $('.classifysentence').length;

$('.choice_hidden').hide();

$(':checkbox').change(function(){
	showMoreOption(this);
});

$(':checkbox:checked').each(function(){
	showMoreOption(this);
})

function showMoreOption(x){
	var option = '.choice_for_'+$(x).attr('id');
	if($(option).is(':visible')){
		$(option).fadeOut();
	}else{
		$(option).fadeIn();
	}
}

function check_checkboxes(){
	var rv = true;
	//check if at least one cat is selected for each checkbox.
	//Commented out for debugging
	for(var i = 1; i < num_sentence; i++){
		var checkboxCat= "input[name='sent_"+i+"']:checked";
		//the checkbox is checked
		if ($(checkboxCat).length > 0){
			//check each of its options
			$(checkboxCat).each(function(){
				var checkboxCatOption = "input[name='"+$(this).attr('id')+"']:checked";
				if($(checkboxCatOption).length == 0){
					return rv = false;
				}
			});
		}
		else{
			$('#error').text('Error! please select at least one category for each sentence!');
			$('#error').show();
			return false;
		}
	}
	if(!rv){
		 $('#error').text('Error! please select at least one option for each category!');
		 $('#error').show();
	}
	return rv;
}