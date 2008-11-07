//using jquery

var RC = {};

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?]/g, '').toLowerCase();
};

RC.DOMnodes = {
	wrong: '.wrong',
	content: '#content',
	seconds: '#seconds',
	timeout: '#timeout',
	loading: '#loading',
	topic: '#topic',
	response: '#response',
	completed: '#completed',
	attempt: '#attempt',
	unexpected: '#unexpected',
	expected: '#expected',
	correct: '#correct',
	wrong: '.wrong',
	try_now: '#try-now',
	try_again: '#try-again',
	show_answer: '#show-answer',
	exercise_phrase: '#exercise-phrase',
	exercise_response: '#exercise-response',
	exercise_no: '#exercise-no',
	question_no: '#question-no',
	current_interval: '#current_interval',
	response_form: '#response-form',
	response_field: '#response-field',
	response_submit: '#response_submit',
	maths: '#maths',
	formula: '#formula',
	expected_maths: '#expected-maths',
	expected_formula: '#expected-formula',
};

RC.centre = function(outer, inner) {
	var offset = $(outer).width()/2 - $(inner).width()/2;
	$(inner).css("margin-left", offset);
};

RC.timer = {

	timeout: 30,
	seconds_to_timeout: RC.timeout,
	total_seconds: 0,
	interval_timer: {},
	
	set_interval_count: function () {
		this.seconds_to_timeout = this.timeout;	
		this.interval_timer = setInterval('RC.timer.increment_seconds()', 1000);	
	},

	increment_seconds: function () {
	  this.total_seconds = this.total_seconds + 1;
		this.seconds_to_timeout = this.seconds_to_timeout - 1;
		if (this.seconds_to_timeout === 0) {
			this.total_seconds = this.total_seconds - this.timeout;
			this.timeout_box();
		}
		$(RC.DOMnodes.seconds).text(this.total_seconds);
	},

	timeout_box: function () {
			$(RC.DOMnodes.timeout).slideDown('slow');
			$(RC.DOMnodes.content).addClass('faded');
			$(RC.DOMnodes.timeout).focus();
			clearInterval(this.interval_timer);
	}

};

RC.formula = {
	
	close_char: ':',
	term_separator: ';',
	formula_prefix: '=',
	
	keys: {
		'_' : { char: '', class: 'denominate' },
		'^' : { char: '', class: 'sup' },
		'$' : { char: '', class: 'sub' },
		'√' : { char: '&radic;', class: 'radical' },
		'%' : { char: '&radic;', class: 'radical' },

	},
	
	term: function(str) {
		if (str) {
			var car = str.charAt(0);
			var cdr = str.slice(1);
			if (car === this.close_char) {
				return '</span>' + this.term(cdr);
			}
			if (this.keys[car]) {
					return this.keys[car].char + '<span class="'+this.keys[car].class+'">' + this.term(cdr);
			}
			return car + this.term(cdr);
		} else {
			return '';
		}
	},

	translate: function(str) {
		if (str && str.charAt(0) === this.formula_prefix) {
			str = str.slice(1);
		}
		var arr = str.split(this.term_separator);
		var phrase = '';
		var i;
		for (i=0; i<arr.length; i+=1) {
			phrase += '<span class="term">' + this.term(arr[i]) + '</span>';
		}
		return phrase;
	},
	
	strip: function(str) {
		if (str && str.charAt(0) === this.formula_prefix) {
			return str.slice(1);
		} else {
			return str;
		}
	},

	is_formula: function(str) {
		if (str && str.charAt(0) === this.formula_prefix) {
			return true;
		} else {
			return false;
		}
	}
	
}

RC.question = {

	json_url: document.location + '.json',
	waiter: null,
	waiting: true,
	data: { status: 'waiting' },
	ignore: false,
	next: { status: 'waiting' },
	
	// wait for slow server
	wait_next: function () {
		this.waiter = setInterval('RC.current.show_next()', 100);
	},

	ignored_data: function() {
		if (this.ignore) {
			return 'ignore=' + this.data.question.id
		} else {
			return '';
		}
	},

	not_finished: function () {
	  if (this.data.status === 'end') {
			$(RC.DOMnodes.response).hide();
    	$(RC.DOMnodes.completed).show();
	    return false;
	  } else {
			return true;
	  }
	},

	loading: function (on) {
		if (on) {
			$(RC.DOMnodes.loading).show();
			this.waiting = true;
		} else {
			$(RC.DOMnodes.loading).hide();
			this.waiting = false;
		}
	},
	
	get_first: function () {
		this.loading(true);
		that = this;
	  $.ajax({
			url: this.json_url,
			dataType: 'json',
			success: function(json){
				that.loading(false);
				that.data = json;
				if (that.not_finished()) {
					that.show();
					that.get_next();
				}
			}
	  });
	},

	get_next: function () {
		that = this;
		this.loading(true);
		this.ignore = true;
	  $.ajax({
			url: this.json_url,
			data: this.ignored_data(),
			dataType: 'json',
			success: function(json){
				if (json.status) {
					that.loading(false);
					that.next = json;
				} else { // something went wrong, try again
					alert('Server error. Please reload the page');
					//that.get_next();
				}
			}
	  });
	},

  show: function() {
		RC.total_seconds = 0;
		$(RC.DOMnodes.wrong).html(' ');
		$(RC.DOMnodes.topic).html(this.data.topic);
		if (RC.formula.is_formula(this.data.exercise.phrase)) {
			$(RC.DOMnodes.exercise_phrase).html(RC.formula.translate(this.data.exercise.phrase));
		} else {
			$(RC.DOMnodes.exercise_phrase).html(this.data.exercise.phrase);
		}
		$(RC.DOMnodes.exercise_response).html(RC.formula.strip(this.data.exercise.response));
		$(RC.DOMnodes.exercise_no).html(this.data.exercise.id);
		$(RC.DOMnodes.question_no).html(this.data.question.id);
		$(RC.DOMnodes.current_interval).html(this.data.question.current_interval.toString());
		$(RC.DOMnodes.response_field).val(this.data.exercise.hint);
		$(RC.DOMnodes.formula).html(' ');
		$(RC.DOMnodes.expected_formula).html(' ');
		if (this.data.question.current_interval === 0) {
		 	$(RC.DOMnodes.expected).show();
			$(RC.DOMnodes.try_now).focus();
		} else {
		  $(RC.DOMnodes.attempt).show();
			$(RC.DOMnodes.response_field).focus();
		}
		if (RC.formula.is_formula(this.data.exercise.response)) {
			$(RC.DOMnodes.expected_formula).html(RC.formula.translate(this.data.exercise.response));
			RC.centre(RC.DOMnodes.expected_maths, RC.DOMnodes.expected_formula);
		}
	},
	
	show_next: function() {
		if (!this.waiting) {
			clearInterval(this.waiter);
			if (this.not_finished()) { 
				this.data = this.next;
				this.show();
				this.next = { status: 'waiting' };
				this.get_next();
			}
		}
	},
	
	post_response: function (result) {
		var post_url = '/questions/' + this.data.question.id + '/responses.json';
		$.post(post_url, {
			'response[result]': result,
		  'response[seconds_taken]': RC.total_seconds, 
	    'response[interval]': this.data.question.current_interval,
		  'authenticity_token': AUTH_TOKEN 
		});
	},
	
	check_response: function (response) {
		response = response.simplify();
		var expected = this.data.exercise.response.simplify();
		var match = false;
		if (RC.formula.is_formula(expected)) {
			expected = RC.formula.strip(expected);
			if (expected === response) {
				match = true;
			}
		} else {
			var pattern = new RegExp(expected);
			if (pattern.test(response)) {
				match = true;
			}
		}
		$(RC.DOMnodes.attempt).hide();
		if (match) {
			this.post_response('correct');
			$(RC.DOMnodes.correct).show().fadeOut(1000);
			this.wait_next();
		} else {
			$(RC.DOMnodes.unexpected).show();
			$(RC.DOMnodes.wrong).html(response);
			$(RC.DOMnodes.try_again).focus();
    }
	}

};


RC.current = RC.question;
RC.current.get_first();

$(document).ready(function(){
	
	$(RC.DOMnodes.response_form).submit(function(){
    var response = $(RC.DOMnodes.response_field).val();
		RC.current.check_response(response);
		return false;
	});

	$(RC.DOMnodes.try_now).click(function() {
		$(RC.DOMnodes.expected).hide();
		$(RC.DOMnodes.attempt).show();
		$(RC.DOMnodes.response_submit).focus();
		$(RC.DOMnodes.response_field).select();
	});

	$(RC.DOMnodes.try_again).click(function() {
		$(RC.DOMnodes.unexpected).hide();
		$(RC.DOMnodes.attempt).show();
		$(RC.DOMnodes.response_field).select();
	});

	$(RC.DOMnodes.show_answer).click(function() {		
		RC.current.post_response('incorrect');
		RC.current.data.question.current_interval = 0;
		$(RC.DOMnodes.unexpected).hide();
		$(RC.DOMnodes.expected).show();
		RC.centre(RC.DOMnodes.expected_maths, RC.DOMnodes.expected_formula);
		$(RC.DOMnodes.try_now).focus();
	});

	$(RC.DOMnodes.response_field).each(function(){
		RC.timer.total_seconds = 0;
		RC.timer.set_interval_count();
	});

	$(RC.DOMnodes.response_field).keyup(function(){
		if (RC.formula.is_formula(RC.current.data.exercise.response)) {
	    var response = $(RC.DOMnodes.response_field).val();
			$(RC.DOMnodes.formula).html(RC.formula.translate(response));
			RC.centre(RC.DOMnodes.maths, RC.DOMnodes.formula);
		}
		RC.timer.seconds_to_timeout = RC.timer.timeout;
	});

	$(RC.DOMnodes.timeout).click(function(){
		$(RC.DOMnodes.timeout).hide();
		$(RC.DOMnodes.content).removeClass('faded');
		$(RC.DOMnodes.response_field).focus();
		RC.timer.set_interval_count();
	});

	$(RC.DOMnodes.content).click(function(){
		if ($(RC.DOMnodes.content).hasClass('faded')) {
			return false;
		}
	});

});

