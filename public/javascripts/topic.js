//using jquery

var RC = {};

RC.table = {
	
	offset: 0,
	limit: 1,
	tbodyId: "",
	downId: "#down",
	upId: "#up",
	data: [],
	
	init: function(data, tbodyId, limit) {
		this.data = data;
		this.tbodyId = tbodyId;
		this.limit = limit;
	},
	
	down: function() {
		this.offset += this.limit;
		this.display();
	},
	
	up: function() {
		this.offset -= this.limit;
		this.display();
	},

	navigation: function() {
		if (this.data.length > this.offset + this.limit ) {
			$(this.downId).show();
		} else {
			$(this.downId).hide();
		}
		if (this.offset > 0 ) {
			$(this.upId).show();
		} else {
			$(this.upId).hide();
		}
	},
	
	display: function() {
		$(this.tbodyId).html('');
		var rowCount = this.data.length - this.offset <  this.limit ? this.data.length - this.offset : this.limit
		for (var row = 0; row < rowCount; row += 1) {
			var tr = "<tr>";
			for (var cell = 0; cell < this.data[row+this.offset].length; cell += 1) {
				tr += "<td>" + this.data[row+this.offset][cell] + "</td>";
			}
			tr += "</tr>";
			$(this.tbodyId).append(tr);
		}
		this.navigation();
	}

};

RC.topic = {
	
	exercises: [],
	message: '',
	rtl: true, 
	
	// if a response is not a number, then it's unlikely that responses should display rtl
	rtl_check: function(text) {
		if (text.match(/[^.\d]/)) {
			this.rtl = false;
		}
	},
	
	parse: function(importedText) {
		var lines = importedText.split("\n");
		for (var i = 0; i < lines.length; i += 1) {
			if ( lines[i].match(/\w/) ) {
				var terms = lines[i].split("\t");
				var phrase = terms[0];
				var response = terms[1];
				var hint = terms[2];
				if ( !phrase || !response ) {
					i += 1;
					this.message = "Incomplete exercise on line " + i;
					return false;
				}
				this.rtl_check(response);
				this.exercises.push([phrase, response, hint ? hint : '']);
			}
		}
		if (this.exercises.length > 0) {
			return true;
		} else {
			this.message = "Please enter some data first";
			return false;
		}
	},
	
	addToForm: function(location, template){
		for (var i = 0; i < this.exercises.length; i += 1) {
			$(location).append( $(template).html() );
			$(".phrase:last", location).val(this.exercises[i][0]);
			$(".response:last", location).val(this.exercises[i][1]);
			$(".hint:last", location).val(this.exercises[i][2]);
		}
	}
	
};

$(document).ready(function(){
	
	$("#hint-help").click(function() {
		return false;
	});

	$("#import-select").children("input:radio").click();
	$("#table").hide();
	$("#finally").hide();
	//$("#firstly").hide();
	//$("#finally").show();

	$(".choice-box").mouseover(function() {
		$(this).addClass("ready");
	});

	$(".choice-box").mouseout(function() {
		$(this).removeClass("ready");
	});
	
	$(".choice-box").click(function() {
		$(".choice-box").removeClass("go");
		$(this).children("input:radio").click();
		$(this).addClass("go");
	});
	
	$("#import-select").click(function() {
		$("#table").hide();
		$("#import").show();
		return false;
	});

	$("#table-select").click(function() {
		$("#import").hide();
		$("#table").show();
		return false;
	});

	$("#import-data").focus(function() {
		if ($(this).hasClass("grey")) {
			$(this).val("");
			$(this).removeClass("grey");
		}
	});

	// click inside append-to-list to add list-item to list
	$("#add-item").click(function() {
		$("#list-template").children().clone().appendTo("#list");
		return false;
	});
	
	$("#down").click(function() {
		RC.table.down();
	});
	
	$("#up").click(function() {
		RC.table.up();
	});

	//split phrase/response/hint/insert in textarea and populate #list from #list-template
	$("#parse-import-data").click(function(){
		if ( RC.topic.parse( $("#import-data").val() ) ) {
			RC.table.init(RC.topic.exercises, '#exercises', 13);
			RC.table.display();
			$("#import").hide();
			$("#table").show();
		} else {
			$(".message").text(RC.topic.message);
			$(".message").addClass("warning");
		}
		return false;
	});
	
	$("#confirm").click(function(){
		if (RC.topic.exercises.length > 0) {
			$("#import-count").text(RC.topic.exercises.length);
			$("#firstly").hide();
			$("#finally").show();
		} else {
			$(".message").text("No data to import");
		}
		return false;
	});
	
	$("#topic_submit").click(function(){
		if ($("#topic_name").val() === '') {
			$(".message").text("Please add a topic name");
			return false;
		} else {
			RC.topic.addToForm("#form-data", "#form-data-template");
		}
	});
	
});

