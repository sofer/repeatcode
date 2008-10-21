//using jquery

// see http://javascript.crockford.com/prototypal.html
if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
};

var RC = {};

RC.timeout = 300;
RC.seconds_to_timeout = RC.timeout;
RC.total_seconds = 0;
RC.waiter;

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?]/g, '').toLowerCase();
};

RC.question = {

	json_url: document.location + '.json',
	
	waiting: true,
	data: { status: 'waiting' },
	ignore: false,
	next: {},
	
	ignored_data: function() {
		if (this.ignore) {
			return "ignore=" + this.data.question.id
		} else {
			return "";
		}
	},

	not_finished: function () {
	  if (this.data.status === 'end') {
			$('#response').hide();
    	$('#completed').show();
	    return false;
	  } else {
			return true;
	  }
	},

	loading: function (on) {
		if (on) {
			$("#loading").show();
			this.waiting = true;
		} else {
			$("#loading").hide();
			this.waiting = false;
		}
	},
	
	get_first: function () {
		this.next = Object.create(this);
		this.loading(true);
		that = this;
	  $.ajax({
			url: this.json_url,
			dataType: "json",
			success: function(json){
				that.loading(false);
				that.data = json;
				if (that.not_finished()) {
					that.show();
					that.next.get();
				}
			}
	  });
	},

	get: function () {
		that = this;
		this.loading(true);
		this.ignore = true;
	  $.ajax({
			url: this.json_url,
			data: this.ignored_data(),
			dataType: "json",
			success: function(json){
				that.loading(false);
				that.data = json;
			}
	  });
	},

  show: function() {
		$(".wrong").html('');
		$("#topic").html(this.data.topic);
		$("#exercise-phrase").html(this.data.exercise.phrase);
		$("#exercise-response").html(this.data.exercise.response);
		$("#exercise-no").html(this.data.exercise.id);
		$("#question-no").html(this.data.question.id);
		$("#current_interval").html(this.data.question.current_interval.toString());
		$('#response-field').val(this.data.exercise.hint);
		if (this.data.question.current_interval === 0) {
		 	$('#expected').show();
			$("#try-now").focus();
		} else {
		  $('#try').show();
			$("#response-field").focus();
		}
	},
	
	show_next: function() {
		if (!this.next.waiting) {
			clearInterval(RC.waiter);
			if (this.next.not_finished()) { 
				this.data = this.next.data;
				this.show();
				this.next.get();
			}
		}
	},
	
	post_response: function (result) {
		var post_url = "/questions/" + this.data.question.id + "/responses.json";
		$.post(post_url, {
			"response[result]": result,
		  "response[seconds_taken]": RC.total_seconds, 
	    "response[interval]": this.data.question.current_interval,
		  "authenticity_token": AUTH_TOKEN 
		});
	}

};


RC.current = RC.question;
RC.next = RC.question;
RC.current.next = RC.next;
RC.current.get_first();

// wait for slow server
var wait_next = function () {
	RC.waiter = setInterval("RC.current.show_next()", 100);
};

var set_interval_count = function () {
	seconds_to_timeout = RC.timeout;
	interval_timer = setInterval("increment_seconds()", 1000);	
};

var increment_seconds = function () {
  total_seconds = total_seconds + 1;
	seconds_to_timeout = seconds_to_timeout - 1;
	if (seconds_to_timeout == 0) {
		total_seconds = total_seconds - RC.timeout;
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
	
	$("#response-form").submit(function(){
		var expected = $("#exercise-response").html().simplify();
		var pattern = new RegExp(expected);
    var response = $("#response-field").val();
		$('#try').hide();
		if (pattern.test(response.simplify())) {
			RC.current.post_response('correct');
      $('#correct').show().fadeOut(1000);
			wait_next();
		} else {
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
		RC.current.post_response('incorrect');
		RC.current.data.question.current_interval = 0;
		$('#unexpected').hide();
		$('#expected').show();
		$("#try-now").focus();
	});

	$("#response-field").each(function(){
		total_seconds = 0;
		set_interval_count();
	});

	$("#response-field").keydown(function(){
		seconds_to_timeout = RC.timeout;
	});

	$("#timeout").click(function(){
		$("#timeout").hide();
		$("#response-field").focus();
		set_interval_count();
	});

});

