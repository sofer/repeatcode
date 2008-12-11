//using jquery

$(document).ready(function(){	

	$("#import-list a").click(function(){
		$("#list-frame").hide();
		$("#import-frame").show();
		return false;
	});

	$("#cancel-import a").click(function(){
		$("#import-frame").hide();
		$("#list-frame").show();
		return false;
	});

	// click inside append-to-list to add list-item to list
	$("#add-item a").click(function(){
		$("#list-template").children().clone().appendTo("#list");
		return false;
	});
	
	//split phrase/response/hint/insert in textarea and populate #list from #list-template
	$("#import-now").click(function(){
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
		$("#import-frame").hide();
		$("#list-frame").show();
		return false;
	});

});

