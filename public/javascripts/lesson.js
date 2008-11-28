//using jquery

var RC = {};

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?]/g, '').toLowerCase();
};

RC.DOMnodes = {
	content: '#content',
	seconds: '#seconds',
	elapsed_time: '#elapsed-time',
	timeout: '#timeout',
	start: '#start',
	loading: '#loading',
	topic: '#topic',
	question: '#question',
	response: '#response',
	completed: '#completed',
	attempt: '#attempt',
	unexpected: '#unexpected',
	expected: '#expected',
	correct: '#correct',
	wrong: '#wrong',
	wrong_answer: '#wrong-answer',
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
	phrase_maths: '#phrase-maths',
	phrase_formula: '#phrase-formula',	
	expected_maths: '#expected-maths',
	expected_formula: '#expected-formula',
	graph: '#graph',
	palette: '#palette',
	button: '.button'
};

RC.centre = function(outer, inner) {
	var offset = $(outer).width()/2 - $(inner).width()/2;
	$(inner).css("margin-left", offset);
};

RC.parens = {
	
	'(': ')',
	'[': ']',
	'{': '}'
}

$.fn.shiftCaret = function (pos) {
	return this.each(function(){
		if (this.selectionStart || this.selectionStart == '0') {
			this.selectionEnd = this.selectionEnd + pos;
		} 
	});
};

RC.augmentResponse = function(response_field) {
	var last_char = $(response_field).val().slice(-1);
	if (RC.parens[last_char]) {
		$(response_field).val($(response_field).val()+RC.parens[last_char]);
		$(response_field).shiftCaret(-1);
	}
};

RC.timer = {

	timeout: 120,
	seconds_to_timeout: 120,
	question_seconds: 0,
	lesson_seconds: 0,
	timed_out: false,
	
	tick: function () {
		RC.timer.increment_seconds(); //apparently, 'this' won't work from inside a setInterval call
	},  
	
	update_question_seconds: function () {
		$(RC.DOMnodes.seconds).text(this.question_seconds);
	},
	
	update_lesson_minutes: function () {
		var minutes =(this.lesson_seconds - this.lesson_seconds % 60) / 60;
		$(RC.DOMnodes.elapsed_time).text(minutes);
	},

	increment_seconds: function () {
		if (!this.timed_out) {
		  this.lesson_seconds += 1;
		  this.question_seconds += 1;
			this.seconds_to_timeout -= 1;
			if (this.seconds_to_timeout === 0) {
				this.question_seconds = this.question_seconds - this.timeout;
				this.timeout_box();
			}
			this.update_question_seconds();
			this.update_lesson_minutes();
		}
	},

	reset_timeout: function () {
		this.seconds_to_timeout = this.timeout;
	},
	
	reset_seconds: function () {
		this.question_seconds = 0;
	},

	timeout_box: function () {
			$(RC.DOMnodes.timeout).slideDown('slow');
			$(RC.DOMnodes.content).addClass('faded');
			$(RC.DOMnodes.timeout).focus();
			this.seconds_to_timeout = this.timeout;
			this.timed_out = true;
	},
	
	end_timeout: function () {
		this.timed_out = false;
	}

};

RC.formula = {
	
	close_char: ';',
	term_separator: '\\',
	formula_prefix: '=',
	html_entity_start: '&',
	denominator: '/',
	space: ' ',
	sum_start: '$',

	spancount: 0,
	
	keys: {
		'^' : { char: '', class: 'sup' },
		'_' : { char: '', class: 'sub' },
		'√' : { char: '&radic;', class: 'radical' },
		'%' : { char: '&radic;', class: 'radical' },

	},
	
	term: function(str) {
		if (str) {
			var car = str.charAt(0);
			var cdr = str.slice(1);
			if (car === this.html_entity_start) { //special case for HTML entities
				var pattern = /^([^\s;]+;)(.*)/;
				var result = cdr.match(pattern);
				if (result) {
					return this.html_entity_start + result[1] + this.term(result[2]);
				}
			}
			if (car === this.sum_start) { //special case for sums
				var pattern = /^\s(\S+)\$(\S+)\b/;
				var result = cdr.match(pattern);
				if (result) {
					return '<span class="n">' + result[1] + '</span><span class="sigma">&Sigma;</span><span class="r">' + result[2] + '</span>'
				}
			}
			if (car === this.close_char) {
				this.spancount -= 1;
				return '</span>' + this.term(cdr);
			}
			if (car === this.denominator) {
				if (this.spancount == 0) {
					return '<span class="denominate">' + this.term(cdr);
				}
			}
			if (this.keys[car]) {
					this.spancount += 1;
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
		str = str.replace(/\b\S+\$\S+\b/g, this.term_separator + '\$ $& ' + this.term_separator); // special case for Sigma
		var arr = str.split(this.term_separator);
		var phrase = '';
		var i;
		for (i=0; i<arr.length; i+=1) {
			this.spancount = 0;
			phrase += '<div class="term">' + this.term(arr[i]) + '</div>';
		}
		// substitute close_char for space
		if (str.slice(-1) === this.space && this.spancount > 0) {
			str = str.slice(0,str.length-1) + this.close_char;
			$(RC.DOMnodes.response_field).val(str);
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
	previously_incorrect: false,
	
	ignored_data: function() {
		if (this.ignore) {
			return 'ignore=' + this.data.question.id
		} else {
			return '';
		}
	},

	not_finished: function (data) {
	  if (data.status === 'end') {
			$(RC.DOMnodes.start).hide();
			$(RC.DOMnodes.question).hide();
			$(RC.DOMnodes.response).hide();
    	$(RC.DOMnodes.completed).show();
	    return false;
	  } else {
			return true;
	  }
	},

	loading: function () {
		$(RC.DOMnodes.loading).show();
		this.waiting = true;
	},
	
	loaded: function (json) {
		$(RC.DOMnodes.loading).hide();
		this.waiting = false;
		if (json.question && json.question.current_interval == null) {
			json.question.current_interval = 0;
		}
	},
	
	get_first: function () {
		this.loading();
		that = this;
	  $.ajax({
			url: this.json_url,
			dataType: 'json',
			error: function () {
				that.get_first();
			},
			success: function (json) {
				that.data = json;
				if (that.not_finished(that.data)) {
					that.loaded(json);
					that.show();
					that.get_next();
				}
			}
	  });
	},

	get_next: function () {
		this.loading(true);
		this.ignore = true;
		that = this;
	  $.ajax({
			url: this.json_url,
			data: this.ignored_data(),
			dataType: 'json',
			error: function () {
				that.get_next();
			},
			success: function(json){
				that.loaded(json);
				that.next = json;
			}
	  });
	},

	hint: function(hint_text) {
		var math_char = '#';
		var split_char = '|';
		$(RC.DOMnodes.response_field).val('');
	 	$(RC.DOMnodes.graph).hide();
		if (!hint_text) return;
		if (hint_text.charAt(0) === math_char) {
			var data = [];
			var functs = hint_text.slice(1);
			var fx_array = functs.split(split_char);
			for (var fx=0; fx<fx_array.length; fx+=1) {
				data.push([]);
				for (var x=-4; x<=4.1; x+=.1) {
		      data[fx].push([x, eval(fx_array[fx])]); //EVIL eval. Is there another way of doing this?
				}
			}
			$.plot($($(RC.DOMnodes.graph)), data, { xaxis: { ticks: [-4,0,4] }, yaxis: { min: -5, max: 10, ticks: [0,10], labelWidth: '10px' }, shadowSize: 0 } );
		 	$(RC.DOMnodes.graph).show();
		} else {
			$(RC.DOMnodes.response_field).val(hint_text);
		}
	},
	
	display_response: function () {
		var response = RC.formula.strip(this.data.exercise.response)
		var re = /(.*)\(([^)]+)\)\s*\|\s*\(([^)]+)\)(.*)/;
		return response.replace(re, '"$1$2$4" or "$1$3$4"')
	},

  show: function() {
		RC.timer.reset_seconds();
		$(RC.DOMnodes.start).hide();
		$(RC.DOMnodes.exercise_response).show();
		$(RC.DOMnodes.palette).hide();
		$(RC.DOMnodes.wrong).html(' ');
		$(RC.DOMnodes.topic).html(this.data.topic);
		if (RC.formula.is_formula(this.data.exercise.phrase)) {
			$(RC.DOMnodes.exercise_phrase).hide();
			$(RC.DOMnodes.phrase_maths).show();
			$(RC.DOMnodes.phrase_formula).html(RC.formula.translate(this.data.exercise.phrase));
			RC.centre(RC.DOMnodes.phrase_maths, RC.DOMnodes.phrase_formula);
		} else {
			$(RC.DOMnodes.exercise_phrase).html(this.data.exercise.phrase);
			$(RC.DOMnodes.phrase_maths).hide();
			$(RC.DOMnodes.exercise_phrase).show();
		}
		$(RC.DOMnodes.exercise_response).html(this.display_response());
		$(RC.DOMnodes.exercise_no).html(this.data.exercise.id);
		$(RC.DOMnodes.question_no).html(this.data.question.id);
		$(RC.DOMnodes.current_interval).html(this.data.question.current_interval.toString());
		this.hint(this.data.exercise.hint);
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
		 	$(RC.DOMnodes.exercise_response).hide();
			$(RC.DOMnodes.palette).show();
		}
		
	},
	
	show_answer: function () {
		this.previously_incorrect = false;
		this.post_response('incorrect');
		this.data.question.current_interval = 0;
		$(RC.DOMnodes.attempt).hide();
		$(RC.DOMnodes.wrong_answer).hide();
		$(RC.DOMnodes.expected).show();
		RC.centre(RC.DOMnodes.expected_maths, RC.DOMnodes.expected_formula);
		$(RC.DOMnodes.try_now).focus();
	},
	
	post_response: function (result) {
		var that = this;
		var post_url = '/questions/' + this.data.question.id + '/responses.json';
		var post_data = {
			'response[result]': result,
		  'response[seconds_taken]': RC.timer.question_seconds, 
	    'response[interval]': this.data.question.current_interval,
		  'authenticity_token': AUTH_TOKEN 
		};
		//show next question before posting response
		if (result == 'correct' && !this.waiting && this.not_finished(this.next)) { 
			this.data = this.next;
			this.show();
		}
		$.ajax({
			url: post_url,
			data: post_data,
			type: 'POST',
			error: function () {
				that.post_response(result);
			},
			success: function(json){
				if (result === 'correct') { //only get next if correcrt answer given
					if (this.waiting) { // still haven't picked up next question. Start again.
						$(RC.DOMnodes.start).show();
						this.get_first();
					} else {
						that.next = { status: 'waiting' };
						that.get_next();
					}
				}
			}
	  });
	},
	
	check_response: function (response) {
		var simplified = response.simplify();
		var expected = this.data.exercise.response.simplify();
		var match = false;
		if (RC.formula.is_formula(expected)) { // no pattern matching on formulas
			expected = RC.formula.strip(expected);
			if (expected === simplified) {
				match = true;
			}
		} else {
			var pattern = new RegExp(expected);
			if (pattern.test(simplified)) {
				match = true;
			}
		}
		$(RC.DOMnodes.attempt).hide();
		if (match) {
			this.previously_incorrect = false;
			this.post_response('correct');
			$(RC.DOMnodes.correct).show().fadeOut(1000);
		} else {
			if (this.previously_incorrect) {
				this.show_answer();
			} else {
				this.previously_incorrect = true; // allow one re-try
				$(RC.DOMnodes.wrong_answer).show();
				$(RC.DOMnodes.wrong).html(response);
				$(RC.DOMnodes.try_again).focus();
			}
    }
	}

};


RC.current = RC.question;
RC.current.get_first();
RC.interval_timer = setInterval(RC.timer.tick, 1000);

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
		$(RC.DOMnodes.wrong_answer).hide();
		$(RC.DOMnodes.attempt).show();
		$(RC.DOMnodes.response_field).select();
	});

	$(RC.DOMnodes.show_answer).click(function() {
		RC.current.show_answer();
	});

	$(RC.DOMnodes.response_field).keyup(function(key){
		RC.augmentResponse(RC.DOMnodes.response_field);
		if (RC.formula.is_formula(RC.current.data.exercise.response)) {
			// move this into function: same 3 lines repeated below
	    var response = $(RC.DOMnodes.response_field).val();
			$(RC.DOMnodes.formula).html(RC.formula.translate(response));
			RC.centre(RC.DOMnodes.maths, RC.DOMnodes.formula);
		}
		RC.timer.reset_timeout();
	});

	$(RC.DOMnodes.button).click(function () {
		var insert = $(this).attr('value');
		$(RC.DOMnodes.response_field).val($(RC.DOMnodes.response_field).val()+insert);
		// move this into function: same 3 lines repeated above
    var response = $(RC.DOMnodes.response_field).val();
		$(RC.DOMnodes.formula).html(RC.formula.translate(response));
		RC.centre(RC.DOMnodes.maths, RC.DOMnodes.formula);
		$(RC.DOMnodes.response_field).focus();
		false;
	})

	$(RC.DOMnodes.timeout).click(function(){
		$(this).hide();
		$(RC.DOMnodes.content).removeClass('faded');
		$(RC.DOMnodes.response_field).focus();
		RC.timer.end_timeout();
	});

	$(RC.DOMnodes.content).click(function(){
		if ($(RC.DOMnodes.content).hasClass('faded')) {
			return false;
		}
	});
	
});

