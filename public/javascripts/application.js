// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

//using jquery

timeout = 30;

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

	$("#response-field").each(function(){
		total_seconds = 0;
		set_interval_count();
	});

	$("#response-field").keydown(function(){
		seconds_to_timeout = timeout;
	});

	$("#timeout").click(function(){
		$("#timeout").hide();
		$("#response-field").focus();
		set_interval_count();
	});

	$(".focus")[0].focus();  // place below other focus functions

});

function set_interval_count(){
	seconds_to_timeout = timeout;
	interval_timer = setInterval("increment_seconds()", 1000);	
}

function increment_seconds(){
	total_seconds = total_seconds + 1;
	seconds_to_timeout = seconds_to_timeout - 1;
	if (seconds_to_timeout == 0) {
		total_seconds = total_seconds - timeout;
		timeout_box();
	}
	$("#seconds").text(total_seconds);
	$("#response_seconds_taken").val(total_seconds);
}

function timeout_box(){
		$("#timeout").slideDown("slow");
		$("#timeout").focus();
		clearInterval(interval_timer);
}
