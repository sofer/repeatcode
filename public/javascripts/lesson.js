//using jquery

var RC = {};

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?\-\\']/g, '').toLowerCase();
};

String.prototype.strip_accents = function () {
	var str = this;
	str=str.replace(/À|Á|Â|Ã|Ä|Å|à|á|â|ã|ä|å/ig,'a');
	str=str.replace(/Ò|Ó|Ô|Õ|Ö|Ø|ò|ó|ô|õ|ö|ø/ig,'o');
	str=str.replace(/È|É|Ê|Ë|è|é|ê|ë/ig,'e');
	str=str.replace(/Ç|ç/ig,'c');
	str=str.replace(/Ì|Í|Î|Ï|ì|í|î|ï/ig,'i');
	str=str.replace(/Ù|Ú|Û|Ü|ù|ú|û|ü/ig,'u');
	str=str.replace(/ÿ/ig,'y');
	str=str.replace(/Ñ|ñ/ig,'n');
	return str;
};

String.prototype.strip_spaces = function () {
	return this.replace(/\s/g, '').toLowerCase();
};

String.prototype.escape_brackets = function () {
	var str = this;
	str = str.replace(/</g, '&lt;');
	str = str.replace(/>/g, '&gt;');
	return str;
};

String.prototype.markup = function () {
	var str=this;
	str  = str.replace(/@(\S[^@]+\S)@/g, '<code>$1</code>');
	str  = str.replace(/\*(\S[^*]+\S)\*/g, '<strong>$1</strong>');
	str  = str.replace(/_(\S[^_]+\S)_/g, '<emphasis>$1</emphasis>');
	return str;
};

RC.centre = function(outer, inner) {
	var offset = $(outer).width()/2 - $(inner).width()/2;
	$(inner).css("margin-left", offset);
};

RC.parens = {
	
	'(': ')',
	'[': ']',
	'{': '}'
};

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

RC.DOMnodes = {
	completed: '#completed',
	content: '#content',
	seconds: '#seconds',
	elapsed_time: '#elapsed-time',
	correct_responses: '#correct-responses',
	target: '#target',
	details: '#details',
	details_switch: '.details-switch',
	extended_chars: '#extended-chars',
	ignore_accents_checkbox: '#ignore-accents',
	speak_phrases_checkbox: '#speak-phrases',
	speak_responses_checkbox: '#speak-responses',
	timeout: '#timeout',
	start: '#start',
	loading: '#loading',
	topic: '#topic',
	question: '#question',
	response: '#response',
	response_block: '#response-block',
	expected_response_block: '#expected-response-block',
	expected_response: '#expected-response',
	submit_button: "#ok",
	response_form: '#response-form',
	response_field: '#response-field',
	translated: '#translated',
	response_message: '#response-message',
	exercise_no: '#exercise-no',
	question_no: '#question-no',
	current_interval: '#current-interval',
	backlog: '#backlog',
	graph: '#graph',
	//palettes: '#palettes',
	maths_palette: '#maths-palette',
	language_palette: '#language-palette',
	days_til_next: '#days-til-next',
	symbol: '.symbol',
	message_envelope: '#message-envelope',
	tabs: '#tabs',
	data_tab: '#data-tab',
	code_tab: '#code-tab',
	output_tab: '#output-tab',
	outfox: '#outfox'	
};

RC.unicode_to_html_entity = function(phrase) {
	return phrase.replace(/\\u(\d\d\d\d)/g, '&#x$1;');
};

// 25 Feb 2009: not using outfox yet, because of problem with non-ASCII characters
// 5 Apr 2009: outfox 0.3.2 fixes the bug with non-ASCII. Switched to outfox.
// 1 May 2009: Still got problems with non-ASCII. Added checking code for users
RC.voices = {
	
	//voice_server_url: 'http://localhost:2000/' no longer using this

	languages: {
		'FR': 'com.acapela.iVox.voice.iVoxJulie22k',
		'IT': 'com.acapela.iVox.voice.iVoxChiara22k',
		'EN': 'com.apple.speech.synthesis.voice.Alex'
	},
	
	installed: false,
	speaking: false,
	pending: [],
	phrase_language: '',
	response_language: '',	
	speak_phrase: false,
	speak_response: false,

	outfox_init: function() {
		if (typeof outfox === 'object') { // check to see if outfox file has been loaded
			this.installed = true; 
			outfox.init("outfox", JSON.stringify, JSON.parse);
	    outfox.startService("audio").addCallback(this.onStart).addErrback(this.onFail);
		}
	},
	
	onStart: function () {
		$(RC.DOMnodes.message_envelope).html('Outfox is installed. You can use text-to-speech.');
	},

	onFail: function (cmd) {
		$(RC.DOMnodes.message_envelope).html(cmd.description);
	},

	outfox_queue: function (phrase, which) {
		if (this.installed && which === 'phrase' && this.speak_phrase ||
				which === 'response' && this.speak_response) {
			if (which === 'phrase') {
				var lang = this.phrase_language;
			} else {
				var lang = this.response_language;
			}
			if (outfox.audio) {
				outfox.audio.setProperty('voice', this.languages[lang]);
				outfox.audio.say(phrase);
				if (which === 'response') {
					$(RC.DOMnodes.message_envelope).html(phrase);
				}
			} else {
				$(RC.DOMnodes.message_envelope).html('outfox: something went wrong...');
			}
		}
	},

	
	// old-style. No longer in use.
	speak: function(phrase, lang) {
		var that = this;
		$(RC.DOMnodes.message_envelope).html('speaking...');
		this.speaking = true;
		$.ajax({
			//async: false,
			url: that.voice_server_url,
			data: { 'lang': lang, 'phrase': phrase },
			dataType: 'jsonp',
			error: function () {
				$(RC.DOMnodes.message_envelope).html('Failed to access voices on your computer.');
			},
			success: function () {
				$(RC.DOMnodes.message_envelope).html('');
			},
			complete: function() {
				that.speaking = false;
				if (that.pending.length > 0) {
					var next = that.pending.shift();
					that.speak(next[0], next[1]);
				}
			}
		});
	},
	
	// old-style. No longer in use.
	queue: function(phrase, which) {
		if (which === 'phrase' && this.speak_phrase ||
				which === 'response' && this.speak_response) {
			if (which === 'phrase') {
				var lang = this.phrase_language;
			} else {
				var lang = this.response_language;
			}
			if (this.speaking) {
				this.pending.push([phrase,lang])
				$(RC.DOMnodes.message_envelope).html('queuing speech...');
			} else {
				this.speak(phrase,lang)
			}
		}
	}
	

}

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
	html_entity_start: '&',
	denominator: '/',
	space: ' ',
	sum: '$',
	combination: 'C',
	integral: 'I',

	spancount: 0,
	
	keys: {
		'^' : { char: '', css_class: 'sup' },
		'_' : { char: '', css_class: 'sub' },
		'√' : { char: '&radic;', css_class: 'radical' },
		'%' : { char: '&radic;', css_class: 'radical' }
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
			if (car === this.sum) { //special case for sums
				var pattern = /^\s(\S+)\$(\S+)\b/;
				var result = cdr.match(pattern);
				if (result) {
					return '<span class="n">' + result[1] + '</span><span class="sigma">&Sigma;</span><span class="r">' + result[2] + '</span>'
				}
			}
			if (car === this.combination) { //special case for combinations
				var pattern = /^\s(\S+)C(\S+)\b/;
				var result = cdr.match(pattern);
				if (result) {
					return '(<span class="sub nospace">' + result[1] + '</span><span class="sup">' + result[2] + '</span>)'
				}
			}
			if (car === this.integral) { //special case for integrals
				var pattern = /^\s(\S+)I(\S+)\b/;
				var result = cdr.match(pattern);
				if (result) {
					return '<span class="n">' + result[1] + '</span><span class="sigma">&int;</span><span class="r">' + result[2] + '</span>'
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
					return this.keys[car].char + '<span class="'+this.keys[car].css_class + '">' + this.term(cdr);
			}
			return car + this.term(cdr);
		} else {
			return '';
		}
	},


	translate: function(str) {
		str = str.escape_brackets();
		str = str.replace(/\b\S+\$\S+\b/g, this.term_separator + '\$ $& ' + this.term_separator); // special case for Sigma
		str = str.replace(/\b\S+C\S+\b/g, this.term_separator + 'C $&' + this.term_separator); // special case for combination
		str = str.replace(/\b\S+I\S+\b/g, this.term_separator + 'I $&' + this.term_separator); // special case for integral
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
	
	display: function(id,str) {
		var formula = '<div class="maths"><div class="formula">' + this.translate(str) + '</div></div>';
		$(id).html(formula);
		var inner = id + ' .maths';
		var outer = id + ' .formula';
		RC.centre(inner, outer);
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
	formula_prefix: '=',
	
	ignored_data: function() {
		if (this.ignore) {
			return 'ignore=' + this.data.question.id
		} else {
			return '';
		}
	},

	strip_prefix: function(str) {
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
	},
	
	not_finished: function (data) {
	  if (data.status === 'end') {
			$(RC.DOMnodes.start).hide();
			$(RC.DOMnodes.question).hide();
			$(RC.DOMnodes.response).hide();
    	$(RC.DOMnodes.completed).show();
			$(RC.DOMnodes.loading).hide();
			if (data.days_until_next == 1) {
				$(RC.DOMnodes.days_til_next).text('a day or so');
			} else {
				$(RC.DOMnodes.days_til_next).text('about ' + data.days_until_next + ' days');
 			}
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
		var that = this;
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
		var that = this;
	  $.ajax({
			url: this.json_url,
			data: this.ignored_data(),
			dataType: 'json',
			error: function () {
				that.get_next();
			},
			success: function(json){
				json.correct += 1
				that.loaded(json);
				that.next = json;
			}
	  });
	},

	hint: function(hint_text) {
		var math_char = '#';
		var split_char = '|';
		if (!hint_text) return;
		if (hint_text.charAt(0) === math_char) {
			var data = [];
			var functs = hint_text.slice(1);
			var fx_array = functs.split(split_char);
			for (var fx=0; fx<fx_array.length; fx+=1) {
				data.push([]);
				for (var x=-4; x<=4.1; x+=.1) {
		      data[fx].push([x, eval(fx_array[fx])]); //Need another way of doing this?
				}
			}
			$.plot($($(RC.DOMnodes.graph)), data, { xaxis: { ticks: [-4,0,4] }, yaxis: { min: -5, max: 10, ticks: [0,10], labelWidth: '10px' }, shadowSize: 0 } );
		 	$(RC.DOMnodes.graph).show();
		} else {
			$(RC.DOMnodes.response_field).val(hint_text);
		}
	},
	
	both_versions: function (text) {
		var re = /(.*)\(([^)]*)\)\s*\|\s*\(([^)]*)\)(.*)/;
		return text.replace(re, '"$1$2$4" or "$1$3$4"')
	},
	
	show_response: function (node, response) {
		$(node).show();
		if (this.is_formula(this.data.exercise.response)) {
			response = this.strip_prefix(response);
			$(node).html(RC.formula.display(node, response));
		} else {
			$(node).html(response);
		}
	},
	
	update_stats: function() {
		$(RC.DOMnodes.exercise_no).text(this.data.exercise.id);
		$(RC.DOMnodes.question_no).text(this.data.question.id);
		$(RC.DOMnodes.current_interval).text(this.data.question.current_interval.toString());
		$(RC.DOMnodes.correct_responses).text(this.data.correct);
		$(RC.DOMnodes.backlog).text(this.data.backlog);
	},
	
	show_response_message: function(message) {
		if (message) {
			$(RC.DOMnodes.response_message).text(message);
		} else if (this.data.correct === parseInt($(RC.DOMnodes.target).text())) {
			$(RC.DOMnodes.response_message).text("CONGRATULATIONS! Today's target reached");
		} else if (this.data.correct % 10 == 0) {
			$(RC.DOMnodes.response_message).text(this.data.correct + ' correct answers');
		} else {
			$(RC.DOMnodes.response_message).text("Correct");
		}
		$(RC.DOMnodes.response_message).show().fadeOut(1000);
	},
	
	show_code: function() {
		if (false) { // WORK IN PROGRESS
			$(RC.DOMnodes.code_tab).html(this.data.topic.code);
			$(RC.DOMnodes.data_tab).html(this.data.topic.data);
			$(RC.DOMnodes.output_tab).html(this.data.topic.code);
			$(RC.DOMnodes.tabs).show();
		}
	},
	
	show_answer: function() {
		$(RC.DOMnodes.response_block).hide();
		$(RC.DOMnodes.expected_response_block).show();
		$(RC.DOMnodes.response).val('');
		if (this.is_formula(this.data.exercise.response)) {
			var formula = this.strip_prefix(this.data.exercise.response);
			$(RC.DOMnodes.expected_response).text('( '+formula+' )');
			RC.formula.display(RC.DOMnodes.translated, formula);
		} else {
			var response = this.both_versions(this.data.exercise.response);
			$(RC.DOMnodes.expected_response).text(response);
		}
		$(RC.DOMnodes.submit_button).focus();
	},
	
	await_response: function() {
		$(RC.DOMnodes.expected_response_block).hide();
		$(RC.DOMnodes.response_block).show();
		$(RC.DOMnodes.response_field).val('')
		$(RC.DOMnodes.translated).val('');
		$(RC.DOMnodes.response_field).focus();
	},
	
	try_again: function () {
		$(RC.DOMnodes.response_field).addClass('incorrect');
		this.previously_incorrect = true; // allow one re-try
		this.show_response_message('Try again');
	},
	
	wrong: function () {
		this.previously_incorrect = false;
		this.post_response('incorrect');
		this.data.question.current_interval = 0;
		this.update_stats();
		this.show_answer();
	},
	
	show: function() {
		RC.timer.reset_seconds();
		$(RC.DOMnodes.response_field).val('');
		$(RC.DOMnodes.translated).html('');
		$(RC.DOMnodes.start).hide();
		$(RC.DOMnodes.response).show();
		$(RC.DOMnodes.graph).hide();
		$(RC.DOMnodes.tabs).hide();
		$(RC.DOMnodes.topic).html(this.data.topic.name);
		this.update_stats();
		this.hint(this.data.exercise.hint);
		if (this.is_formula(this.data.exercise.phrase)) {
			RC.formula.display(RC.DOMnodes.question, this.strip_prefix(this.data.exercise.phrase));
		} else {
			this.show_code();
			var phrase = this.both_versions(this.data.exercise.phrase).markup();
			$(RC.DOMnodes.question).html(phrase);
			RC.voices.outfox_queue(phrase, 'phrase');
		}
		var response = this.both_versions(this.strip_prefix(this.data.exercise.response));
		response = RC.unicode_to_html_entity(response); //convert to HTML entities 
		if (this.data.question.current_interval === 0) {
			RC.voices.outfox_queue(response, 'response');
			this.show_answer();
		} else {
			this.await_response();
		}
		if (this.is_formula(this.data.exercise.response)) {
			$(RC.DOMnodes.maths_palette).show();
		}
		
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
		//if correct and not waiting and course not finished, show next question
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
				if (result === 'correct') { //only get next if correct answer given
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
		var expected = this.data.exercise.response;
		var match = false;
		if (this.is_formula(expected)) { // no pattern matching on formulas
			expected = this.strip_prefix(expected);
			if (expected.strip_spaces() === response.strip_spaces()) {
				match = true;
			}
		} else {
			if (this.data.ignore_punctuation === true) {
				var expected_pattern = expected.simplify();
				var response_pattern = response.simplify();
			} else {
				var expected_pattern = expected.strip_spaces();
				var response_pattern = response.strip_spaces();
			}
			if ($(RC.DOMnodes.ignore_accents_checkbox).is(':checked')) {
				expected_pattern = expected_pattern.strip_accents();
				response_pattern = response_pattern.strip_accents();
			}
			var pattern = new RegExp(expected_pattern);
			if (pattern.test(response_pattern)) {
				match = true;
			}
		}
		if (match) {
			RC.voices.outfox_queue(this.both_versions(expected), 'response');
			this.previously_incorrect = false;
			this.post_response('correct');
			this.show_response_message();
		} else {
			// incorrect
			if (this.previously_incorrect) {
				RC.voices.outfox_queue(this.both_versions(expected), 'response');
				this.wrong();
			} else {
				this.try_again();
			}
    }
	}

};

RC.current = RC.question;
RC.current.get_first();
RC.interval_timer = setInterval(RC.timer.tick, 1000);

$(document).ready(function(){
	
	RC.voices.outfox_init();
	
	if ($(RC.DOMnodes.speak_phrases_checkbox).length > 0) {
		$(RC.DOMnodes.speak_phrases_checkbox).attr('checked', false);
		RC.voices.phrase_language = $(RC.DOMnodes.speak_phrases_checkbox).attr("language");
	}
	
	if ($(RC.DOMnodes.speak_responses_checkbox).length > 0) {
		$(RC.DOMnodes.speak_responses_checkbox).attr('checked', false);
		RC.voices.response_language = $(RC.DOMnodes.speak_responses_checkbox).attr("language");
	}
	
	$(RC.DOMnodes.ignore_accents_checkbox).attr('checked', false);

	$(RC.DOMnodes.speak_phrases_checkbox).click(function(){
		RC.voices.speak_phrase = !RC.voices.speak_phrase;
		$(RC.DOMnodes.response_field).focus();
	});
	
	$(RC.DOMnodes.speak_responses_checkbox).click(function(){
		RC.voices.speak_response = !RC.voices.speak_response;
		$(RC.DOMnodes.response_field).focus();
	});
	
	$(RC.DOMnodes.response_form).submit(function(){
    var response = $(RC.DOMnodes.response_field).val();
		RC.current.check_response(response);
		return false;
	});

	$(RC.DOMnodes.ignore_accents_checkbox).click(function(){
		$(RC.DOMnodes.response_field).focus();
	});

	$(RC.DOMnodes.submit_button).click(function () {
		RC.current.await_response();
	});

	$(RC.DOMnodes.response_field).focus(function (){
		RC.timer.reset_timeout();
	});

	$(RC.DOMnodes.response_field).keydown(function (key){
		if ($(RC.DOMnodes.response_field).hasClass('incorrect')) {
			$(RC.DOMnodes.response_field).removeClass('incorrect');
		}
	});

	$(RC.DOMnodes.response_field).keyup(function (key){
		RC.augmentResponse(RC.DOMnodes.response_field);
		if (RC.question.is_formula(RC.current.data.exercise.response)) {
			RC.formula.display(RC.DOMnodes.translated, $(RC.DOMnodes.response_field).val());
		}
		RC.timer.reset_timeout();
	});

	$(RC.DOMnodes.symbol).click(function () {
		var insert = $(this).attr('value');
		$(RC.DOMnodes.response_field).val($(RC.DOMnodes.response_field).val()+insert);
		if (RC.question.is_formula(RC.current.data.exercise.response)) {
			RC.formula.display(RC.DOMnodes.translated, $(RC.DOMnodes.response_field).val());
		}
		$(RC.DOMnodes.response_field).focus();
		return false;
	})

	$(RC.DOMnodes.timeout).click(function() {
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
	
	$(RC.DOMnodes.details_switch).click(function() {
		$(RC.DOMnodes.details_switch).toggle()
		$(RC.DOMnodes.details).toggle()
		return false;
	});

	$(RC.DOMnodes.ignore_accents_checkbox).click(function() {
		$(RC.DOMnodes.extended_chars).toggle()
	});

});

