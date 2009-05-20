//using jquery

var RC = {};

String.prototype.simplify = function () {
	return this.replace(/[\s,.!?\-\\']/g, '').toLowerCase();
};

String.prototype.stripAccents = function () {
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

String.prototype.stripSpaces = function () {
	return this.replace(/\s/g, '').toLowerCase();
};

String.prototype.replaceSymbols = function () {
	var str = this;
	str = str.replace(/(\d)\s*x\s*(\d)/g, '$1 &times; $2');
	return str;
};


String.prototype.escapeBrackets = function () {
	var str = this;
	str = str.replace(/</g, '&lt;');
	str = str.replace(/>/g, '&gt;');
	return str;
};

String.prototype.markup = function () {
	var str=this;
	str  = str.replace(/@([^@]+)@/g, '<code>$1</code>');
	str  = str.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
	str  = str.replace(/_([^_]+)_/g, '<em>$1</em>');
	return str;
};

String.prototype.reverse = function () {
	return this.split('').reverse().join('')
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

RC.DOMnodes = {
	completed: '#completed',
	content: '#content',
	seconds: '#seconds',
	elapsedTime: '#elapsed-time',
	correctResponses: '#correct-responses',
	target: '#target',
	details: '#details',
	detailsSwitch: '.details-switch',
	extendedChars: '#extended-chars',
	ignoreAccentsCheckbox: '#ignore-accents',
	voices: '#voices',
	voicesSwitch: '#voices-switch',
	phraseVoice: '#phrase-voice',
	responseVoice: '#response-voice',
	voicesForm: '#voices-form',
	timeout: '#timeout',
	start: '#start',
	loading: '#loading',
	topic: '#topic',
	question: '#question',
	response: '#response',
	responseBlock: '#response-block',
	expectedResponseBlock: '#expected-response-block',
	expectedResponse: '#expected-response',
	submitButton: "#ok",
	responseForm: '#response-form',
	responseField: '#response-field',
	translated: '#translated',
	responseMessage: '#response-message',
	exerciseNo: '#exercise-no',
	questionNo: '#question-no',
	currentInterval: '#current-interval',
	backlog: '#backlog',
	graph: '#graph',
	//palettes: '#palettes',
	mathsPalette: '#maths-palette',
	languagePalette: '#language-palette',
	daysTilNext: '#days-til-next',
	symbol: '.symbol',
	messageEnvelope: '#message-envelope',
	tabs: '#tabs',
	dataTab: '#data-tab',
	codeTab: '#code-tab',
	outputTab: '#output-tab',
	outfox: '#outfox'	
};

RC.unicodeToHtmlEntity = function(phrase) {
	return phrase.replace(/\\u(\d\d\d\d)/g, '&#x$1;');
};

// 25 Feb 2009: not using outfox yet, because of problem with non-ASCII characters
// 5 Apr 2009: outfox 0.3.2 fixes the bug with non-ASCII. Switched to outfox.
// 1 May 2009: Still got problems with non-ASCII. Added checking code for users
RC.voices = {
	
	isFirefox: false,
	isInstalled: false,
	speaking: false,
	pending: [],
	phraseVoice: '',
	responseVoice: '',
	installedVoices: [],

	outfoxInit: function() {
		this.isFirefox = navigator.userAgent !== null && navigator.userAgent.indexOf('Firefox/') !== -1 ;
		if (this.isFirefox) { 
			if (typeof outfox === 'object') { // check to see if outfox file has been loaded
				this.isInstalled = true;
				this.phraseVoice = $(RC.DOMnodes.phraseVoice).val(),
				this.responseVoice = $(RC.DOMnodes.responseVoice).val(),
				outfox.init("outfox", JSON.stringify, JSON.parse);
	    	outfox.startService("audio").addCallback(this.onStart).addErrback(this.onFail);
			}
		} else {
			$(RC.DOMnodes.messageEnvelope).html('');
		}
	},
	
	onStart: function () {
		$(RC.DOMnodes.messageEnvelope).html('Outfox is installed. Voices are available for this lesson.');
		$(RC.DOMnodes.voicesSwitch).show();
		this.installedVoices = outfox.audio.getProperty('voices');
		var options = '';
		for (var i=0; i<this.installedVoices.length; i++) {
			var label = this.installedVoices[i].match(/[^.]+$/);
			options += '<option value="'+this.installedVoices[i]+'">' + label + '</option>';
		}
		$(RC.DOMnodes.phraseVoice).append(options);
		$(RC.DOMnodes.responseVoice).append(options);
		
	},

	onFail: function (cmd) {
		$(RC.DOMnodes.messageEnvelope).html(cmd.description);
	},

	outfoxQueue: function (phrase, which) {
		if (this.isFirefox && this.isInstalled && (which === 'phrase' && this.phraseVoice ||
				which === 'response' && this.responseVoice)) {
			if (which === 'phrase') {
				var voice = this.phraseVoice;
			} else {
				var voice = this.responseVoice;
				phrase = phrase.replace(/\(.*?\)/g, ''); //strip out brackets
			}
			if (outfox.audio) {
				outfox.audio.setProperty('voice', voice);
				outfox.audio.say(phrase);
			}
		}
	},

	setVoices: function() {
		$(RC.DOMnodes.voices).show();
		$(RC.DOMnodes.content).addClass('faded');
		RC.timer.timedOut = true;
	},
	
	updateVoices: function() {
		this.phraseVoice = $(RC.DOMnodes.phraseVoice).val();
		this.responseVoice = $(RC.DOMnodes.responseVoice).val();

		$(RC.DOMnodes.voices).hide();
		$(RC.DOMnodes.content).removeClass('faded');
		$(RC.DOMnodes.responseField).focus();
		this.timedOut = false;
		
		// update course
		var postUrl = '/courses/' + RC.question.data.question.course_id + '.json';
		var postData = {
			'course[phrase_voice]': this.phraseVoice,
			'course[response_voice]': this.responseVoice,
		  'authenticity_token': AUTH_TOKEN 
		};
		$.ajax({
			type: 'PUT',
			url: postUrl,
			data: postData,
			success: function() {
				$(RC.DOMnodes.messageEnvelope).html('Course voices updated.');
			}
	  });
	}
	
}

RC.timer = {

	timeout: 120,
	secondsToTimeout: this.timeout,
	questionSeconds: 0,
	lessonSeconds: 0,
	timedOut: false,
	
	tick: function () {
		RC.timer.incrementSeconds(); //apparently, 'this' won't work from inside a setInterval call
	},  
	
	updateQuestionSeconds: function () {
		$(RC.DOMnodes.seconds).text(this.questionSeconds);
	},
	
	updateLessonMinutes: function () {
		var minutes =(this.lessonSeconds - this.lessonSeconds % 60) / 60;
		$(RC.DOMnodes.elapsedTime).text(minutes);
	},

	incrementSeconds: function () {
		if (!this.timedOut) {
		  this.lessonSeconds += 1;
		  this.questionSeconds += 1;
			this.secondsToTimeout -= 1;
			if (this.secondsToTimeout === 0) {
				this.questionSeconds = this.questionSeconds - this.timeout;
				this.timeoutBox();
			}
			this.updateQuestionSeconds();
			this.updateLessonMinutes();
		}
	},

	resetTimeout: function () {
		this.secondsToTimeout = this.timeout;
	},
	
	resetSeconds: function () {
		this.questionSeconds = 0;
	},

	timeoutBox: function () {
			$(RC.DOMnodes.timeout).slideDown('slow');
			$(RC.DOMnodes.content).addClass('faded');
			$(RC.DOMnodes.timeout).focus();
			$("a").attr('disabled','disabled');
			this.secondsToTimeout = this.timeout;
			this.timedOut = true;
	},
	
	endTimeout: function () {
		$(RC.DOMnodes.timeout).hide();
		$(RC.DOMnodes.content).removeClass('faded');
		$(RC.DOMnodes.responseField).focus();
		this.timedOut = false;
	}

};

RC.formula = {
	
	closeChar: ';',
	termSeparator: '\\',
	htmlEntityStart: '&',
	denominator: '/',
	space: ' ',
	sum: '$',
	combination: 'C',
	integral: 'I',

	spancount: 0,
	
	keys: {
		'^' : { char: '', cssClass: 'sup' },
		'_' : { char: '', cssClass: 'sub' },
		'√' : { char: '&radic;', cssClass: 'radical' },
		'%' : { char: '&radic;', cssClass: 'radical' }
	},
	
	term: function(str) {
		if (str) {
			var car = str.charAt(0);
			var cdr = str.slice(1);
			if (car === this.htmlEntityStart) { //special case for HTML entities
				var pattern = /^([^\s;]+;)(.*)/;
				var result = cdr.match(pattern);
				if (result) {
					return this.htmlEntityStart + result[1] + this.term(result[2]);
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
			if (car === this.closeChar) {
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
					return this.keys[car].char + '<span class="'+this.keys[car].cssClass + '">' + this.term(cdr);
			}
			return car + this.term(cdr);
		} else {
			return '';
		}
	},


	translate: function(str) {
		str = str.escapeBrackets();
		str = str.replace(/\b\S+\$\S+\b/g, this.termSeparator + '\$ $& ' + this.termSeparator); // special case for Sigma
		str = str.replace(/\b\S+C\S+\b/g, this.termSeparator + 'C $&' + this.termSeparator); // special case for combination
		str = str.replace(/\b\S+I\S+\b/g, this.termSeparator + 'I $&' + this.termSeparator); // special case for integral
		var arr = str.split(this.termSeparator);
		var phrase = '';
		var i;
		for (i=0; i<arr.length; i+=1) {
			this.spancount = 0;
			phrase += '<div class="term">' + this.term(arr[i]) + '</div>';
		}
		// substitute closeChar for space
		if (str.slice(-1) === this.space && this.spancount > 0) {
			str = str.slice(0,str.length-1) + this.closeChar;
			$(RC.DOMnodes.responseField).val(str);
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

	jsonUrl: document.location + '.json',
	waiter: null,
	waiting: true,
	data: { status: 'waiting' },
	ignore: false,
	next: { status: 'waiting' },
	previouslyIncorrect: false,
	formulaPrefix: '=',
	
	ignoredData: function() {
		if (this.ignore) {
			return 'ignore=' + this.data.question.id
		} else {
			return '';
		}
	},

	stripPrefix: function(str) {
		if (str && str.charAt(0) === this.formulaPrefix) {
			return str.slice(1);
		} else {
			return str;
		}
	},

	isFormula: function(str) {
		if (str && str.charAt(0) === this.formulaPrefix) {
			return true;
		} else {
			return false;
		}
	},
	
	isBoolean: function(str) {
		str = str.stripSpaces();
		if (str === 'true' || str === 'false' || str === 'yes' || str === 'no' ) {
			return true
		}
	},
	
	notFinished: function (data) {
	  if (data.status === 'end') {
			$(RC.DOMnodes.start).hide();
			$(RC.DOMnodes.question).hide();
			$(RC.DOMnodes.response).hide();
    	$(RC.DOMnodes.completed).show();
			$(RC.DOMnodes.loading).hide();
			if (data.daysUntilNext == 1) {
				$(RC.DOMnodes.daysTilNext).text('a day or so');
			} else {
				$(RC.DOMnodes.daysTilNext).text('about ' + data.days_until_next + ' days');
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
		if (json.question && json.question.currentInterval == null) {
			json.question.currentInterval = 0;
		}
	},
	
	getFirst: function () {
		this.loading();
		var that = this;
	  $.ajax({
			url: this.jsonUrl,
			dataType: 'json',
			error: function () {
				that.getFirst();
			},
			success: function (json) {
				that.data = json;
				if (that.notFinished(that.data)) {
					that.loaded(json);
					that.show();
					that.getNext();
				}
			}
	  });
	},

	getNext: function () {
		this.loading(true);
		this.ignore = true;
		var that = this;
	  $.ajax({
			url: this.jsonUrl,
			data: this.ignoredData(),
			dataType: 'json',
			error: function () {
				that.getNext();
			},
			success: function(json){
				json.correct += 1
				that.loaded(json);
				that.next = json;
			}
	  });
	},

	hint: function(hintText) {
		var mathChar = '#';
		var splitChar = '|';
		if (!hintText) return;
		if (hintText.charAt(0) === mathChar) {
			var data = [];
			var functs = hintText.slice(1);
			var fxArray = functs.split(splitChar);
			for (var fx=0; fx<fxArray.length; fx+=1) {
				data.push([]);
				for (var x=-4; x<=4.1; x+=.1) {
		      data[fx].push([x, eval(fxArray[fx])]); //Need another way of doing this?
				}
			}
			$.plot($($(RC.DOMnodes.graph)), data, { xaxis: { ticks: [-4,0,4] }, yaxis: { min: -5, max: 10, ticks: [0,10], labelWidth: '10px' }, shadowSize: 0 } );
		 	$(RC.DOMnodes.graph).show();
		} else {
			$(RC.DOMnodes.responseField).val(hintText);
		}
	},
	
	bothVersions: function (text) {
		var re = /(.*)\(([^)]*)\)\s*\|\s*\(([^)]*)\)(.*)/;
		return text.replace(re, '"$1$2$4" or "$1$3$4"')
	},
	
	// use for arithmetic operations
	reverseOrder: function() {
		var val = $(RC.DOMnodes.responseField).val();
		$(RC.DOMnodes.responseField).val($(RC.DOMnodes.responseField).val()+' ');
	},
	
	augmentResponse: function(key) {
		var lastChar = $(RC.DOMnodes.responseField).val().slice(-1);
		if (RC.parens[lastChar]) {
			$(RC.DOMnodes.responseField).val($(RC.DOMnodes.responseField).val()+RC.parens[lastChar]);
			$(RC.DOMnodes.responseField).shiftCaret(-1);
		}
		if (this.isFormula(this.data.question.response)) {
			RC.formula.display(RC.DOMnodes.translated, $(RC.DOMnodes.responseField).val());
		}
		if (this.data.topic.rtl) {
			var fieldValue = $(RC.DOMnodes.responseField).val();
			// use key.keyCode.fromCharCode();
			if (key.keyCode === 8) { // delete key
				fieldValue = fieldValue.slice(0,fieldValue.length-1)
			} else {
				fieldValue = fieldValue + ' '
			}
			$(RC.DOMnodes.responseField).val(fieldValue);
		}
	},
	
	showPhrase: function () {
		var phrase = this.data.question.phrase;
		if (this.data.question.current_interval > 0) {
			phrase = phrase.replace(/\(\(.*?\)\)/g, '');
		} else {
			phrase = phrase.replace(/\(\((.*?)\)\)/g, '$1');
		}
		phrase = this.bothVersions(phrase);
		phrase = phrase.markup();
		phrase = phrase.replaceSymbols();
		$(RC.DOMnodes.question).html(phrase);
		RC.voices.outfoxQueue(phrase, 'phrase');
	},

	showResponse: function (node, response) {
		$(node).show();
		if (this.isFormula(this.data.question.response)) {
			response = this.stripPrefix(response);
			$(node).html(RC.formula.display(node, response));
		} else {
			$(node).html(response);
		}
	},
	
	updateStats: function() {
		$(RC.DOMnodes.exerciseNo).text(this.data.question.exercise_id);
		$(RC.DOMnodes.questionNo).text(this.data.question.id);
		$(RC.DOMnodes.currentInterval).text(this.data.question.current_interval.toString());
		$(RC.DOMnodes.correctResponses).text(this.data.correct);
		$(RC.DOMnodes.backlog).text(this.data.backlog);
	},
	
	showResponseMessage: function(message) {
		if (message) {
			$(RC.DOMnodes.responseMessage).text(message);
		} else if (this.data.correct === parseInt($(RC.DOMnodes.target).text())) {
			$(RC.DOMnodes.responseMessage).text("CONGRATULATIONS! Today's target reached");
		} else if (this.data.correct % 10 == 0) {
			$(RC.DOMnodes.responseMessage).text(this.data.correct + ' correct answers');
		} else {
			$(RC.DOMnodes.responseMessage).text("Correct");
		}
		$(RC.DOMnodes.responseMessage).show().fadeOut(1000);
	},
	
	showCode: function() {
		if (false) { // WORK IN PROGRESS
			$(RC.DOMnodes.codeTab).html(this.data.topic.code);
			$(RC.DOMnodes.dataTab).html(this.data.topic.data);
			$(RC.DOMnodes.outputTab).html(this.data.topic.code);
			$(RC.DOMnodes.tabs).show();
		}
	},
	
	showAnswer: function() {
		$(RC.DOMnodes.responseBlock).hide();
		$(RC.DOMnodes.expectedResponseBlock).show();
		$(RC.DOMnodes.response).val('');
		if (this.isFormula(this.data.question.response)) {
			var formula = this.stripPrefix(this.data.question.response);
			$(RC.DOMnodes.expectedResponse).text('( '+formula+' )');
			RC.formula.display(RC.DOMnodes.translated, formula);
		} else {
			var response = this.bothVersions(this.data.question.response);
			$(RC.DOMnodes.expectedResponse).text(response);
		}
		$(RC.DOMnodes.submitButton).focus();
	},
	
	awaitResponse: function() {
		$(RC.DOMnodes.expectedResponseBlock).hide();
		$(RC.DOMnodes.responseBlock).show();
		$(RC.DOMnodes.responseField).val('')
		$(RC.DOMnodes.translated).val('');
		$(RC.DOMnodes.responseField).focus();
	},
	
	tryAgain: function () {
		$(RC.DOMnodes.responseField).addClass('incorrect');
		this.previouslyIncorrect = true; // allow one re-try
		this.showResponseMessage('Try again');
	},
	
	wrong: function () {
		this.previouslyIncorrect = false;
		this.postResponse('incorrect');
		this.data.question.current_interval = 0;
		this.updateStats();
		this.showAnswer();
		this.showResponseMessage('Try again');
	},
	
	randomNumberInRange: function (min,max) {
	  var range = max - min + 1
	  var rand = Math.floor(Math.random() * range)
	  return min + rand
	},
	
	prepare: function () {
		var phrase = this.data.question.phrase;
		var result;
		var re = /\[\[([^\]]+)\]\]/g;
		while (result = re.exec(phrase)) {
			if (result[1]) {
				alert(result[0] + ' : ' + result[1] + ' : ' + result[2] );
			}
		}
		if (phrase.match(/\[\[([^\]]+)\]\]/)) {
			
			//alert('matched');
			//var response = this.data.question.\[response;
			//response = eval(response); // Warning:eval! collect the phrase matches
			//alert(response);
			
		}
	},
	
	show: function() {
		RC.timer.resetSeconds();
		this.prepare();
		$(RC.DOMnodes.responseField).val('');
		$(RC.DOMnodes.translated).html('');
		$(RC.DOMnodes.start).hide();
		$(RC.DOMnodes.response).show();
		$(RC.DOMnodes.graph).hide();
		$(RC.DOMnodes.tabs).hide();
		$(RC.DOMnodes.topic).html(this.data.topic.name);
		this.updateStats();
		this.hint(this.data.question.hint);
		if (this.data.topic.rtl) {
			$(RC.DOMnodes.responseField).addClass('rtl');
		} else {
			$(RC.DOMnodes.responseField).removeClass('rtl');
		}
		if (this.isFormula(this.data.question.phrase)) {
			RC.formula.display(RC.DOMnodes.question, this.stripPrefix(this.data.question.phrase));
		} else {
			this.showCode();
			this.showPhrase();
		}
		var response = this.bothVersions(this.stripPrefix(this.data.question.response));
		response = RC.unicodeToHtmlEntity(response); //convert to HTML entities 
		if (this.data.question.current_interval === 0) {
			RC.voices.outfoxQueue(response, 'response');
			this.showAnswer();
		} else {
			this.awaitResponse();
		}
		if (this.isFormula(this.data.question.response)) {
			$(RC.DOMnodes.mathsPalette).show();
		}
		
	},
	
	postResponse: function (result) {
		var that = this;
		var postUrl = '/questions/' + this.data.question.id + '/responses.json';
		var postData = {
			'response[result]': result,
		  'response[seconds_taken]': RC.timer.questionSeconds, 
	    'response[interval]': this.data.question.current_interval,
		  'authenticity_token': AUTH_TOKEN 
		};
		//if correct and not waiting and course not finished, show next question
		if (result == 'correct' && !this.waiting && this.notFinished(this.next)) { 
			this.data = this.next;
			this.show();
		}
		$.ajax({
			url: postUrl,
			data: postData,
			type: 'POST',
			error: function () {
				that.postResponse(result);
			},
			success: function(json){
				if (result === 'correct') { //only get next if correct answer given
					if (this.waiting) { // still haven't picked up next question. Start again.
						$(RC.DOMnodes.start).show();
						this.getFirst();
					} else {
						that.next = { status: 'waiting' };
						that.getNext();
					}
				}
			}
	  });
	},
	
	checkResponse: function (response) {
		var expected = this.data.question.response;
		var match = false;
		if (this.isBoolean(expected) && expected.charAt(0) === response.charAt(0) ) {
			match = true;
		} else if (this.isFormula(expected)) { // no pattern matching on formulas
			expected = this.stripPrefix(expected);
			if (expected.stripSpaces() === response.stripSpaces()) {
				match = true;
			}
		} else {
			if (this.data.topic.ignore_punctuation === true) {
				var expectedPattern = expected.simplify();
				var responsePattern = response.simplify();
			} else {
				var expectedPattern = expected.stripSpaces();
				var responsePattern = response.stripSpaces();
			}
			if ($(RC.DOMnodes.ignoreAccentsCheckbox).is(':checked')) {
				expectedPattern = expectedPattern.stripAccents();
				responsePattern = responsePattern.stripAccents();
			}
			if (this.data.topic.rtl) {
				responsePattern = responsePattern.reverse();
			}
			var pattern = new RegExp(expectedPattern);
			if (pattern.test(responsePattern)) {
				match = true;
			}
		}
		if (match) {
			RC.voices.outfoxQueue(this.bothVersions(expected), 'response');
			this.previouslyIncorrect = false;
			this.postResponse('correct');
			this.showResponseMessage();
		} else {
			// incorrect
			if (this.previouslyIncorrect || this.isBoolean(expected)) {
				RC.voices.outfoxQueue(this.bothVersions(expected), 'response');
				this.wrong();
			} else {
				this.tryAgain();
			}
    }
	}

};

RC.current = RC.question;
RC.current.getFirst();
RC.intervalTimer = setInterval(RC.timer.tick, 1000);

$(document).ready(function(){
	
	RC.voices.outfoxInit();
	
	$(RC.DOMnodes.ignoreAccentsCheckbox).attr('checked', false);

	$(RC.DOMnodes.responseForm).submit(function(){
    var response = $(RC.DOMnodes.responseField).val();
		RC.current.checkResponse(response);
		return false;
	});

	$(RC.DOMnodes.ignoreAccentsCheckbox).click(function(){
		$(RC.DOMnodes.responseField).focus();
	});

	$(RC.DOMnodes.submitButton).click(function () {
		RC.current.awaitResponse();
	});

	$(RC.DOMnodes.responseField).focus(function (){
		RC.timer.resetTimeout();
	});

	$(RC.DOMnodes.responseField).keydown(function (key){
		if ($(RC.DOMnodes.responseField).hasClass('incorrect')) {
			$(RC.DOMnodes.responseField).removeClass('incorrect');
		}
	});

	$(RC.DOMnodes.responseField).keyup(function (key){
		RC.current.augmentResponse(key);
		RC.timer.resetTimeout();
	});
	
		$(RC.DOMnodes.symbol).click(function () {
		var insert = $(this).attr('value');
		$(RC.DOMnodes.responseField).val($(RC.DOMnodes.responseField).val()+insert);
		if (RC.question.isFormula(RC.current.data.question.response)) {
			RC.formula.display(RC.DOMnodes.translated, $(RC.DOMnodes.responseField).val());
		}
		$(RC.DOMnodes.responseField).focus();
		return false;
	})

	$(RC.DOMnodes.timeout).click(function() {
		RC.timer.endTimeout();
	});

	$(RC.DOMnodes.content).click(function(){
		if ($(RC.DOMnodes.content).hasClass('faded')) {
			return false;
		}
	});
	
	$(RC.DOMnodes.detailsSwitch).click(function() {
		if (!$(RC.DOMnodes.content).hasClass('faded')) {
			$(RC.DOMnodes.detailsSwitch).toggle();
			$(RC.DOMnodes.details).toggle();
			$(RC.DOMnodes.responseField).focus();
		}
		return false;
	});

	$(RC.DOMnodes.voicesSwitch).click(function() {
		if (!$(RC.DOMnodes.content).hasClass('faded')) {
			RC.voices.setVoices();
		}
		return false;
	});
	
	$(RC.DOMnodes.voicesForm).submit(function() {
		RC.voices.updateVoices();
		return false;
	});
	
	$(RC.DOMnodes.ignoreAccentsCheckbox).click(function() {
		$(RC.DOMnodes.extendedChars).toggle();
	});

});

