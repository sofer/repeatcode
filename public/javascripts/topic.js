//using jquery

$(document).ready(function(){	

	$(".toggle").click(function(){
		$(this).toggle();
		return false;
	});

	// click inside a toggle-switch to toggle all toggleable elements
	$(".toggle-switch a").click(function(){
		$(".toggleable").toggle();
		return false;
	});

	// click inside append-to-list to add list-item to list
	$(".append-to-list a").click(function(){
		$("#list-template").children().clone().appendTo("#list");
		return false;
	});
	
	//split phrase/response/hint/insert in textarea and populate #list from #list-template
	$("#add-items").click(function(){
		import_text = $("#import").val();
		import_array = import_text.split("\n");
		for (var i = 0; i < import_array.length; i += 1) {
			item = $("#list-template").html()
			terms = import_array[i].split("\t");
			phrase = terms[0];
			response = terms[1];
			hint = terms[2];
			insert = terms[3];
			if (phrase != "" && response != "") {
				item = $(item);
				$(".phrase input", item).val(phrase);
				$(".response input", item).val(response);
				$(".hint input", item).val(hint);
				$(".insert input", item).val(insert);
				$("#list").append(item);
			}
		}
		$(".toggleable").toggle();
		return false;
	});

});
