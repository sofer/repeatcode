//using jquery

var auth_token = "37bf976218d3c8bf81eec7938df94c3f5e2034eb";
var timeout = 300;
var seconds_to_timeout = timeout;
var total_seconds = 0;

// a bit of syntactic sugar to allow us to add new methods to existing object types
// see http://javascript.crockford.com/inheritance.html
Function.prototype.method = function (name, func) {
	this.prototype[name] = func;
	return this;
};

String.method('simplify', function () {
	return this.replace(/[\s,.!?]/g, '').toLowerCase();
});

var current; 
var next;
var json_url = document.location + '.json';

/*
var question = {

  get_next: function () {
    return '';
  };
  show: fuunction() {
  	$("#topic").html(this.topic);
  	$("#exercise-phrase").html(this.exercise.phrase);
  	$("#exercise-response").html(this.exercise.response);    
  };
};
*/

var get_next_question = function (excluded_id) {
  $.getJSON( json_url + '?exclude=' + excluded_id, function(json){
		next = json;
  });
};

var not_completed = function (question) {
  if (question.end) {
    $('#response').hide();
    $('#completed').show();
    return false;
  } else {
    return true;
  }
};

var load_first_question = $.getJSON( json_url, function(json){
  if (not_completed(json)) {
  	current = json;
  	show_question(current);
  	get_next_question(current.question.id);
  }
});

var show_question = function (question) {
	$(".wrong").html('');
	$("#topic").html(question.topic);
	$("#exercise-phrase").html(question.exercise.phrase);
	$("#exercise-response").html(question.exercise.response);
	$("#exercise-no").html(question.exercise.id);
	$("#question-no").html(question.question.id);
	$("#current_interval").html(question.question.current_interval.toString());
	$('#response-field').val(question.exercise.hint);
	if (question.question.current_interval === 0) {
	  $('#try').hide();
	 	$('#expected').show();
		$("#try-now").focus();
	} else {
	  $('#try').show();
		$("#response-field").focus();
	}
};

var post_response = function (result) {
	var post_url = "/questions/" + current.question.id + "/responses.json";
	$.post(post_url, {
		"response[result]": result,
	  "response[seconds_taken]": total_seconds, 
    "response[interval]": current.question.current_interval,
	  "authenticity_token": AUTH_TOKEN 
	});
};

var set_interval_count = function () {
	seconds_to_timeout = timeout;
	interval_timer = setInterval("increment_seconds()", 1000);	
};

var increment_seconds = function () {
  total_seconds = total_seconds + 1;
	seconds_to_timeout = seconds_to_timeout - 1;
	if (seconds_to_timeout == 0) {
		total_seconds = total_seconds - timeout;
		timeout_box();
	}
	$("#seconds").text(total_seconds);
	$("#response_seconds_taken").val(total_seconds);
};

var timeout_box = function () {
		$("#timeout").slideDown("slow");
		$("#timeout").focus();
		clearInterval(interval_timer);
};

$(document).ready(function(){
	
	// eventually move this stuff into a separate js file
	$("#response").load(function(){
		load_first_question;
	});
	
	$("#response-form").submit(function(){
		var expected = $("#exercise-response").html().simplify();
		var pattern = new RegExp(expected);
    var response = $("#response-field").val();
		if (pattern.test(response.simplify())) {
			post_response('correct');
		  if (not_completed(next)) {
		  	show_question(next);    
		  	current = next; 
				get_next_question(current.question.id);
		  }
      $('#correct').show().fadeOut(1000);
		} else {
			$('#try').hide();
			$('#unexpected').show();
			$(".wrong").html(response);
			$("#try-again").focus();
    }
		return false;
	});

	$("#try-now").click(function() {
		$('#expected').hide();
		$('#try').show();
		$("#response-submit").focus();
		$('#response-field').select();
	});

	$("#try-again").click(function() {
		$('#unexpected').hide();
		$('#try').show();
		$('#response-field').select();
	});

	$("#show-answer").click(function() {
		post_response('incorrect');
		current.question.current_interval = 0;
		$('#unexpected').hide();
		$('#expected').show();
		$("#try-now").focus();
	});

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

});

