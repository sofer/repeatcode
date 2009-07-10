
String.prototype.simplify = function () {
	return this.replace(/[,.!?\-\\']/g, '').toLowerCase();
};

String.prototype.stripAccents = function () {
	var str = this;
	str = str.replace(/À|Á|Â|Ã|Ä|Å|à|á|â|ã|ä|å/ig,'a');
	str = str.replace(/Ò|Ó|Ô|Õ|Ö|Ø|ò|ó|ô|õ|ö|ø/ig,'o');
	str = str.replace(/È|É|Ê|Ë|è|é|ê|ë/ig,'e');
	str = str.replace(/Ç|ç/ig,'c');
	str = str.replace(/Ì|Í|Î|Ï|ì|í|î|ï/ig,'i');
	str = str.replace(/Ù|Ú|Û|Ü|ù|ú|û|ü/ig,'u');
	str = str.replace(/ÿ/ig,'y');
	str = str.replace(/Ñ|ñ/ig,'n');
	return str;
};

String.prototype.stripExtraSpaces = function () {
	var str = this;
	str = str.replace(/^\s+/g, '');
	str = str.replace(/\s+$/g, '');
	str = str.replace(/\s+/g, ' ');
	return str;
};

String.prototype.stripAllSpaces = function () {
	return this.replace(/\s/g, '');
};

String.prototype.replaceSymbols = function () {
	var str = this;
	str = str.replace(/(\d)\s*(x|\*)\s*(\d)/g, '$1 &times; $3');
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
	amend: '#amend',
	amendLink: '#amend-link',
	ignore: '#ignore',
	ignoreLink: '#ignore-link',
	completed: '#completed',
	content: '#content',
	seconds: '#seconds',
	elapsedTime: '#elapsed-time',
	correctResponses: '#correct-responses',
	target: '#target',
	details: '#details',
	detailsSwitch: '.details-switch',
	notesLink: '#notes-link',
	notesText: '#notes-text',
	extendedChars: '#extended-chars',
	ignoreAccentsCheckbox: '#ignore-accents',
	voices: '#voices',
	voicesLink: '#voices-link',
	phraseVoice: '#phrase-voice',
	responseVoice: '#response-voice',
	voicesForm: '#voices-form',
	timeout: '#timeout',
	wait: '#wait',
	loading: '#loading',
	topic: '#topic',
	question: '#question',
	response: '#response',
	answer: '#answer',
	answerText: '#answer-text',
	submitButton: "#ok",
	responseForm: '#response-form',
	responseField: '#response-field',
	formattedAnswer: '#formatted-answer',
	formattedResponse: '#formatted-response',
	exerciseNo: '#exercise-no',
	questionNo: '#question-no',
	currentInterval: '#current-interval',
	backlog: '#backlog',
	graph: '#graph',
	//palettes: '#palettes',
	mathsPalette: '#maths-palette',
	languagePalette: '#language-palette',
	symbol: '.symbol',
	notice: '#notice',
	progressAlert: '#progress-alert',
	tabs: '#tabs',
	dataTab: '#data-tab',
	codeTab: '#code-tab',
	outputTab: '#output-tab',
	outfox: '#outfox'	
};

// not sure if this is necessary!
RC.unicodeToHtmlEntity = function(phrase) {
	return phrase.replace(/\\u(\d\d\d\d)/g, '&#x$1;');
};

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
			$(RC.DOMnodes.notice).text('');
		}
	},
	
	onStart: function () {
		$(RC.DOMnodes.notice).text('Outfox is installed. Set your "Voices" preferences above.');
		$(RC.DOMnodes.voicesLink).fadeIn();
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
		$(RC.DOMnodes.notice).text(cmd.description);
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
		$(RC.DOMnodes.voices).fadeIn();
		RC.timer.timedOut = true;
	},
	
	updateVoices: function() {
		this.phraseVoice = $(RC.DOMnodes.phraseVoice).val();
		this.responseVoice = $(RC.DOMnodes.responseVoice).val();

		this.cancelVoicesForm();
		
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
				$(RC.DOMnodes.notice).text('Course voices updated.');
			}
	  });
	},
	
	cancelVoicesForm: function() {
		$(RC.DOMnodes.voices).fadeOut(400);
		$(RC.DOMnodes.submitButton).focus();
		RC.timer.timedOut = false;
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
			$(RC.DOMnodes.timeout).focus();
			$("a").attr('disabled','disabled');
			this.secondsToTimeout = this.timeout;
			this.timedOut = true;
	},
	
	endTimeout: function () {
		$(RC.DOMnodes.timeout).fadeOut(400);
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
	next: { status: 'waiting' },
	previouslyIncorrect: false,
	formulaPrefix: '=',

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
		if (str === 'true' || str === 'false' || str === 'yes' || str === 'no' ) {
			return true
		}
	},
	
	bothVersions: function (text) {
		var re = /(.*)\(([^)]*)\s*\|\s*([^)]*)\)(.*)/;
		return text.replace(re, '$1$2$4, $1$3$4')
	},
	
	randomNumberInRange: function (min,max) {
	  var range = max - min + 1
	  var rand = Math.floor(Math.random() * range)
	  return min + rand
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
			RC.formula.display(RC.DOMnodes.formattedResponse, $(RC.DOMnodes.responseField).val());
		}
		if (this.data.topic.rtl) {
			var fieldValue = $(RC.DOMnodes.responseField).val();
			// use key.keyCode.fromCharCode();
			//alert(key.keyCode);
			var str = '0123456789';
			var txt = '';
			//for (var i=0;i<10;++) {
				
			//}
			if (key.keyCode === 8) { // delete key
				fieldValue = fieldValue.slice(0,fieldValue.length-1)
			} else {
				fieldValue = fieldValue + ' '
			}
			$(RC.DOMnodes.responseField).val(fieldValue);
		}
	},
	
	notFinished: function (data) {
	  if (data.status === 'end') {
			$(RC.DOMnodes.wait).fadeOut(400);
			$(RC.DOMnodes.question).hide();
			$(RC.DOMnodes.response).hide();
    	$(RC.DOMnodes.completed).fadeIn();
			$(RC.DOMnodes.loading).hide();
	    return false;
	  } else {
			return true;
	  }
	},

	loading: function () {
		$(RC.DOMnodes.loading).fadeIn();
		this.waiting = true;
	},
	
	loaded: function () {
		$(RC.DOMnodes.loading).hide();
		this.waiting = false;
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
				that.loaded();
				if (that.notFinished(that.data)) {
					that.getNext();
					that.showNext();
				}
			}
		});
	},

	getNext: function () {
		this.loading(true);
		var that = this;
		$.ajax({
			url: this.jsonUrl,
			data: 'ignore=' + this.data.question.id,
			dataType: 'json',
			error: function () {
				that.getNext();
			},
			success: function(json){
				that.next = json;
				that.loaded();
			}
		});
	},

	// do a very simple test for XSS before executing eval
	xEval: function(func, x) {
		return (/^[!-~ ]+$/.test(func)) && eval(func);	
	},

	prepareHint: function() {
		var hint = this.data.question.hint;
		var mathChar = '#';
		var splitChar = '|';
		if (!hint) return;
		if (hint.charAt(0) === mathChar) {
			var data = [];
			var functs = hint.slice(1);
			var fxArray = functs.split(splitChar);
			for (var func=0; func<fxArray.length; func+=1) {
				data.push([]);
				for (var x=-4; x<=4.1; x+=.1) {
					//var fx = this.xEval(fxArray[func], x);
					var fx = eval(fxArray[func]);
					data[func].push([x, fx]);
				}
			}
			$.plot($($(RC.DOMnodes.graph)), data, { xaxis: { ticks: [-4,0,4] }, yaxis: { min: -5, max: 10, ticks: [0,10], labelWidth: '10px' }, shadowSize: 0 } );
		 	$(RC.DOMnodes.graph).show();
		} else {
			$(RC.DOMnodes.responseField).val(hint);
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
			$(RC.DOMnodes.progressAlert).text(message);
		} else if (this.data.correct === parseInt($(RC.DOMnodes.target).text())) {
			$(RC.DOMnodes.progressAlert).text("CONGRATULATIONS! Today's target reached");
			$(RC.DOMnodes.notice).text("CONGRATULATIONS! Today's target reached");
		} else if (this.data.correct % 10 == 0 && this.data.correct > 0) {
			$(RC.DOMnodes.progressAlert).text(this.data.correct + ' correct answers');
		} else {
			$(RC.DOMnodes.progressAlert).text("Correct");
		}
		$(RC.DOMnodes.progressAlert).show().fadeOut(1000);
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
		$(RC.DOMnodes.response).hide();
		$(RC.DOMnodes.answer).show();
		$(RC.DOMnodes.submitButton).focus();
	},
	
	awaitResponse: function() {
		$(RC.DOMnodes.formattedResponse).val('');
		$(RC.DOMnodes.answer).hide();
		$(RC.DOMnodes.response).show();
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
		$(RC.DOMnodes.responseField).val('');
		this.prepareHint();
		this.showAnswer();
	},
	
	prepare: function () {
		var phrase = this.data.question.phrase;
		var result;
		var re = /\[\[([^\]]+)\]\]/g;
		while (result = re.exec(phrase)) {
			if (result[1]) {
				// alert(result[0] + ' : ' + result[1] + ' : ' + result[2] );
			}
		}
		if (phrase.match(/\[\[([^\]]+)\]\]/)) {
			
			//alert('matched');
			//var response = this.data.question.\[response;
			//response = eval(response); // Warning:eval! collect the phrase matches
			//alert(response);
			
		}
	},
	
	preparePhrase: function () {
		var phrase = this.data.question.phrase;
		if (this.isFormula(phrase)) { // MATHS
			RC.formula.display(RC.DOMnodes.question, this.stripPrefix(phrase));
		} else {
			if (this.data.question.current_interval === 0) { // (()) DENOTES INTRO TEXT
				phrase = phrase.replace(/\(\((.*?)\)\)/g, '$1');
			} else {
				phrase = phrase.replace(/\(\(.*?\)\)/g, ''); 
			}
			phrase = this.bothVersions(phrase);
			RC.voices.outfoxQueue(phrase, 'phrase');
			phrase = phrase.markup();
			phrase = phrase.replaceSymbols();
			$(RC.DOMnodes.question).html(phrase);
		}
	},
	
	prepareResponse: function() {
		if (this.data.topic.rtl) {
			$(RC.DOMnodes.responseField).addClass('rtl');
		} else {
			$(RC.DOMnodes.responseField).removeClass('rtl');
		}
		if (this.isFormula(this.data.question.response)) {
			var formula = this.stripPrefix(this.data.question.response);
			$(RC.DOMnodes.answerText).text('( '+formula+' )');
			$(RC.DOMnodes.answer).show();
			RC.formula.display(RC.DOMnodes.formattedAnswer, formula);
			$(RC.DOMnodes.answer).hide();
			$(RC.DOMnodes.mathsPalette).show();
		} else {
			var response = this.bothVersions(this.stripPrefix(this.data.question.response));
			response = RC.unicodeToHtmlEntity(response); //convert to HTML entities 
			$(RC.DOMnodes.answerText).text(response);
		}
		if (this.data.question.current_interval === 0) {
			RC.voices.outfoxQueue(response, 'response');
			this.showAnswer();
		} else {
			this.awaitResponse();
		}
	},
	
	addNotes: function() {
		if (this.data.question.notes) {
			$(RC.DOMnodes.notesText).text(this.data.question.notes);
			$(RC.DOMnodes.notesLink).fadeIn();
		} else {
			$(RC.DOMnodes.notesLink).fadeOut();
		}
	},

	showResponse: function(node, response) {
		$(node).show();
		if (this.isFormula(this.data.question.response)) {
			response = this.stripPrefix(response);
			$(node).html(RC.formula.display(node, response));
		} else {
			$(node).text(response);
		}
	},
	
	clearFields: function() {
		$(RC.DOMnodes.graph).hide();
		$(RC.DOMnodes.tabs).hide();
		$(RC.DOMnodes.responseField).val('');
		$(RC.DOMnodes.formattedResponse).html('');
		$(RC.DOMnodes.formattedAnswer).html('');
	},

	showNext: function() {
		$(RC.DOMnodes.wait).fadeOut(400);
		$(RC.DOMnodes.topic).text(this.data.topic.name);
		RC.timer.resetSeconds();
		this.updateStats();
		this.clearFields();
		$(RC.DOMnodes.response).show();
		this.preparePhrase();
		this.prepareHint();
		this.prepareResponse();
		this.addNotes();
	},
	
	postResponse: function (result) {
		var that = this;
		var postUrl = '/questions/' + this.data.question.id + '/responses.json';
		var postData = {
			'response[result]'			: result,
			'response[seconds_taken]'	: RC.timer.questionSeconds, 
			'response[interval]'		: this.data.question.current_interval,
			'authenticity_token'		: AUTH_TOKEN 
		};
		//if not incorrect and not waiting and course not finished, show next question
		if (result !== 'incorrect' && !this.waiting && this.notFinished(this.next)) { 
			this.data = this.next;
			this.showNext();
		}
		$.ajax({
			url: postUrl,
			data: postData,
			type: 'POST',
			error: function () {
				that.postResponse(result);
			},
			success: function(json){
				if (result !== 'incorrect') { //don't get next if incorrect answer given
					if (this.waiting) { // still haven't picked up next question. Start again.
						$(RC.DOMnodes.wait).show();
						this.getFirst();
					} else {
						that.next = { status: 'waiting' };
						that.getNext();
					}
				}
			}
	  });
	},
	
	compareTerms: function(expected, response, separator) {
		expectedTerms = expected.split(separator);
		responseTerms = response.split(separator);
		if (!expectedTerms[expectedTerms.length-1]) {
			expectedTerms.pop();
		}
		if (!responseTerms[responseTerms.length-1]) {
			responseTerms.pop();
		}
		for (responseTerm in responseTerms) {
			var found = false;
			for (expectedTerm in expectedTerms) {
				if (responseTerms[responseTerm].stripAllSpaces() === expectedTerms[expectedTerm].stripAllSpaces()) {
					found = true;
					expectedTerms[expectedTerm] = null;
					break;
				}
			}
			if (found === false) {
				return false;
			}
		}
		for (expectedTerm in expectedTerms) {
			if (expectedTerms[expectedTerm] !== null) {
				return false;
			}
		}
		return true;
	},

	checkResponse: function (response) {
		response = response.stripExtraSpaces();
		var expected = this.data.question.response.stripExtraSpaces();
		if (!this.data.caseSensitive) { // needs to be added
			response = response.toLowerCase();
			expected = expected.toLowerCase();
		}
		var match = false;
		if (this.isBoolean(expected)) {
			if (expected.charAt(0) === response.charAt(0)) {
				match = true;
			} 
		} else {
			expected = this.stripPrefix(expected); // in case it is a formula
			if (this.data.topic.ignore_punctuation === true) {
				expected = expected.simplify();
				response = response.simplify();
			}
			if ($(RC.DOMnodes.ignoreAccentsCheckbox).is(':checked')) {
				expected = expected.stripAccents();
				response = response.stripAccents();
			}
			if (this.data.topic.rtl) {
				response = response.reverse();
			}
			if (expected.match(/^(\([^)]+\)){2,}$/)) { // i.e. of the form (a)(b)
				match = this.compareTerms(expected, response, ')');
			} else if (this.data.topic.unordered) {
				match = this.compareTerms(expected, response, ' ');
			} else {
				if (expected.match(/\|/)) { // i.e. it looks like a regex
					var pattern = new RegExp(expected);
					if (pattern.test(response)) {
						match = true;
					}
				} else {
					if (expected === response) {
						match = true;
					}
				}
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

RC.corrections = {
	
	showAmendForm: function() {
		RC.timer.timedOut = true;
		$("#amend-notes", RC.DOMnodes.amend).val(''); // not sure why i need this
		$("#amend-phrase", RC.DOMnodes.amend).val(RC.question.data.question.phrase);
		$("#amend-response", RC.DOMnodes.amend).val(RC.question.data.question.response);
		$("#amend-hint", RC.DOMnodes.amend).val(RC.question.data.question.hint);
		$("#amend-notes", RC.DOMnodes.amend).val(RC.question.data.question.notes);
		$(RC.DOMnodes.amend).fadeIn();
	},
	
	showIgnoreForm: function() {
		RC.timer.timedOut = true;
		$(".phrase", RC.DOMnodes.ignore).text(RC.question.data.question.phrase);
		$(".response", RC.DOMnodes.ignore).text(RC.question.data.question.response);
		$(RC.DOMnodes.ignore).fadeIn();
	},

	amend: function() {
		this.cancelAmendForm();
		var phrase = $("#amend-phrase", RC.DOMnodes.amend).val();
		var response = $("#amend-response", RC.DOMnodes.amend).val();
		var hint = $("#amend-hint", RC.DOMnodes.amend).val();
		var notes = $("#amend-notes", RC.DOMnodes.amend).val();
		RC.question.data.question.phrase = phrase;
		RC.question.data.question.response = response;
		RC.question.data.question.hint = hint;
		RC.question.data.question.notes = notes;
		RC.question.showNext();
		var postUrl = '/questions/' + RC.question.data.question.id + '.json';
		var postData = {
			'question[amended]': true,
			'question[phrase]': phrase,
			'question[response]': response,
			'question[hint]': hint,
			'question[notes]': notes,
		  'authenticity_token': AUTH_TOKEN 
		};
		$.ajax({
			type: 'PUT',
			url: postUrl,
			data: postData,
			success: function() {
				$(RC.DOMnodes.notice).text('Question updated.');
			}
	  });
	},
	
	ignore: function() {
		this.cancelIgnoreForm();
		var postUrl = '/questions/' + RC.question.data.question.id + '.json';
		var postData = {
			'question[ignore]': true,
		  'authenticity_token': AUTH_TOKEN 
		};
		$.ajax({
			type: 'PUT',
			url: postUrl,
			data: postData,
			success: function() {
				$(RC.DOMnodes.notice).text('Question removed.');
				RC.question.postResponse('ignored');
			}
	  });
	},

	cancelAmendForm: function() {
		$(RC.DOMnodes.amend).fadeOut(400);
		$(RC.DOMnodes.submitButton).focus();
		RC.timer.timedOut = false;
	},
	
	cancelIgnoreForm: function() {
		$(RC.DOMnodes.ignore).fadeOut(400);
		$(RC.DOMnodes.submitButton).focus();
		RC.timer.timedOut = false;
	}

};

$(document).ready(function(){

	RC.intervalTimer = setInterval(RC.timer.tick, 1000);
	RC.question.getFirst();
	RC.voices.outfoxInit();
	
	
	$(RC.DOMnodes.ignoreAccentsCheckbox).attr('checked', false);

	$(RC.DOMnodes.amendLink).click(function () {
		RC.corrections.showAmendForm();
		return false;
	});

	$(RC.DOMnodes.ignoreLink).click(function () {
		RC.corrections.showIgnoreForm();
		return false;
	});
	
	$(RC.DOMnodes.voicesLink).click(function() {
		RC.voices.setVoices();
		return false;
	});
	
	$(":submit[value='Cancel']", RC.DOMnodes.amend).click(function() {
		RC.corrections.cancelAmendForm();
		return false;
	});

	$(":submit[value='OK']", RC.DOMnodes.amend).click(function() {
		RC.corrections.amend();
		return false;
	});

	$(":submit[value='Cancel']", RC.DOMnodes.ignore).click(function() {
		RC.corrections.cancelIgnoreForm();
		return false;
	});

	$(":submit[value='OK']", RC.DOMnodes.ignore).click(function() {
		RC.corrections.ignore();
		return false;
	});

	$(":submit[value='Cancel']", RC.DOMnodes.voices).click(function() {
		RC.voices.cancelVoicesForm();
		return false;
	});

	$(":submit[value='OK']", RC.DOMnodes.voices).click(function() {
		RC.voices.updateVoices();
		return false;
	});

	$(RC.DOMnodes.ignoreAccentsCheckbox).click(function () {
		$(RC.DOMnodes.responseField).focus();
	});

	$(RC.DOMnodes.submitButton).click(function () {
		RC.question.awaitResponse();
	});

	$(RC.DOMnodes.responseForm).submit(function(){
    	var response = $(RC.DOMnodes.responseField).val();
		RC.question.checkResponse(response);
		return false;
	});

	$(RC.DOMnodes.responseField).focus(function (){
		RC.timer.resetTimeout();
	});

	$(RC.DOMnodes.responseField).keydown(function (){
		if ($(RC.DOMnodes.responseField).hasClass('incorrect')) {
			$(RC.DOMnodes.responseField).removeClass('incorrect');
		}
	});

	$(RC.DOMnodes.responseField).keyup(function (key){
		RC.question.augmentResponse(key);
		RC.timer.resetTimeout();
	});
	
	$(RC.DOMnodes.symbol).click(function () {
		var insert = $(this).attr('value');
		$(RC.DOMnodes.responseField).val($(RC.DOMnodes.responseField).val()+insert);
		if (RC.question.isFormula(RC.question.data.question.response)) {
			RC.formula.display(RC.DOMnodes.formattedResponse, $(RC.DOMnodes.responseField).val());
		}
		$(RC.DOMnodes.responseField).focus();
		return false;
	})

	$(RC.DOMnodes.timeout).click(function() {
		RC.timer.endTimeout();
	});

	$(RC.DOMnodes.detailsSwitch).click(function() {
		$(RC.DOMnodes.detailsSwitch).toggle();
		$(RC.DOMnodes.details).toggle();
		$(RC.DOMnodes.responseField).focus();
		return false;
	});

	$(RC.DOMnodes.ignoreAccentsCheckbox).click(function() {
		$(RC.DOMnodes.extendedChars).toggle();
	});

});

