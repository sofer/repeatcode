//using jquery

var RC = {};

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?]/g, '').toLowerCase();
};

// make this lot into a timer object
RC.timeout = 300;
RC.seconds_to_timeout = RC.timeout;
RC.total_seconds = 0;
RC.interval_timer;
var set_interval_count = function () {
	RC.seconds_to_timeout = RC.timeout;	
	RC.interval_timer = setInterval('increment_seconds()', 1000);	
};

var increment_seconds = function () {
  RC.total_seconds = RC.total_seconds + 1;
	RC.seconds_to_timeout = RC.seconds_to_timeout - 1;
	if (RC.seconds_to_timeout === 0) {
		RC.total_seconds = RC.total_seconds - RC.timeout;
		timeout_box();
	}
	$('#seconds').text(RC.total_seconds);
	$('#response_seconds_taken').val(RC.total_seconds);
};

var timeout_box = function () {
		$('#timeout').slideDown('slow');
		$('#timeout').focus();
		clearInterval(RC.interval_timer);
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
			$('#response').hide();
    	$('#completed').show();
	    return false;
	  } else {
			return true;
	  }
	},

	loading: function (on) {
		if (on) {
			$('#loading').show();
			this.waiting = true;
		} else {
			$('#loading').hide();
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
					that.get_next();
				}
			}
	  });
	},

  show: function() {
		RC.total_seconds = 0;
		$('.wrong').html(' ');
		$('#topic').html(this.data.topic);
		if (RC.formula.is_formula(this.data.exercise.phrase)) {
			$('#exercise-phrase').html(RC.formula.translate(this.data.exercise.phrase));
		} else {
			$('#exercise-phrase').html(this.data.exercise.phrase);
		}
		$('#exercise-response').html(RC.formula.strip(this.data.exercise.response));
		$('#exercise-no').html(this.data.exercise.id);
		$('#question-no').html(this.data.question.id);
		$('#current_interval').html(this.data.question.current_interval.toString());
		$('#response-field').val(this.data.exercise.hint);
		$('#formula').html(' ');
		$('#expected-formula').html(' ');
		if (RC.formula.is_formula(this.data.exercise.response)) {
			$('#expected-formula').html(RC.formula.translate(this.data.exercise.response));
		}
		if (this.data.question.current_interval === 0) {
		 	$('#expected').show();
			$('#try-now').focus();
		} else {
		  $('#try').show();
			$('#response-field').focus();
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
		var expected = this.data.exercise.response.simplify();
		expected = RC.formula.strip(expected);
		var pattern = new RegExp(expected);
		$('#try').hide();
		alert(pattern + ' + ' + response.simplify());
		if (pattern.test(response.simplify())) {
			this.post_response('correct');
			$('#correct').show().fadeOut(1000);
			this.wait_next();
		} else {
			$('#unexpected').show();
			$('.wrong').html(response);
			$('#try-again').focus();
    }
	}

};


RC.current = RC.question;
RC.current.get_first();

$(document).ready(function(){
	
	$('#response-form').submit(function(){
    var response = $('#response-field').val();
		RC.current.check_response(response);
		return false;
	});

	$('#try-now').click(function() {
		$('#expected').hide();
		$('#try').show();
		$('#response-submit').focus();
		$('#response-field').select();
	});

	$('#try-again').click(function() {
		$('#unexpected').hide();
		$('#try').show();
		$('#response-field').select();
	});

	$('#show-answer').click(function() {		
		RC.current.post_response('incorrect');
		RC.current.data.question.current_interval = 0;
		$('#unexpected').hide();
		$('#expected').show();
		$('#try-now').focus();
	});

	$('#response-field').each(function(){
		RC.total_seconds = 0;
		set_interval_count();
	});

	$('#response-field').keyup(function(){
		if (RC.formula.is_formula(RC.current.data.exercise.response)) {
	    var response = $('#response-field').val();
			$('#formula').html(RC.formula.translate(response));
		}
		RC.seconds_to_timeout = RC.timeout;
	});

	$('#timeout').click(function(){
		$('#timeout').hide();
		$('#response-field').focus();
		set_interval_count();
	});

});

