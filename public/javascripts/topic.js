
RC.topic = {
	
	importedExercises: [],
	addedExercises: 0,
	message: '',
	rtl: true, 
	
	// if a response is not a number, then it's unlikely that responses should display rtl
	rtl_check: function(text) {
		if (text.match(/[^.\d]/)) {
			this.rtl = false;
		}
	},
	
	parse: function(importedText) {
		this.importedExercises = [];
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
				this.importedExercises.push([phrase, response, hint ? hint : '']);
			}
		}
		if (this.importedExercises.length > 0) {
			this.message = "";
			return true;
		} else {
			this.message = "Please enter some data";
			return false;
		}
	},
	
	addImportedData: function(location, template){
		if (this.importedExercises.length > 0) {
			$("#exercises").html('');
			for (var i = 0; i < this.importedExercises.length; i += 1) {
				$("#hidden-fields").append( $("#hidden-exercise-template").html() );
				$(".phrase:last", "#hidden-fields").val(this.importedExercises[i][0]);
				$(".response:last", "#hidden-fields").val(this.importedExercises[i][1]);
				$(".hint:last", "#hidden-fields").val(this.importedExercises[i][2]);
				var row = "<tr>" +
									"<td class=\"first\">" + i + "</td>" +
									"<td>" + this.importedExercises[i][0] + "</td>" +
									"<td>" + this.importedExercises[i][1] + "</td>" +
									"<td>" + this.importedExercises[i][2] + "</td>" +
									"</tr>"
				$("#exercises").append(row);
			}
		}
	},
	
	checkScratchTable: function(){
		this.addedExercises = $("#exercises > tr td.phrase input[value!='']").length;
	}
};

$(document).ready(function(){
	
	RC.table.init('#exercises', 12);
	
	$("#hint-help").click(function() {
		alert("Nothing here yet");
		return false;
	});

	$("#choose-import").children("input:radio").click();
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
	
	$("#choose-import").click(function() {
		$("#table").hide();
		$("#import").show();
		return false;
	});

	$("#choose-table").click(function() {
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

	$("#parse-import-data").click(function(){
		$(".message").text(RC.topic.message);
		if ( RC.topic.parse( $("#import-data").val() ) ) {
			RC.topic.addImportedData();
			RC.table.init('#exercises', 13);
			RC.table.display();
			$("#choose").hide();
			$("#import").hide();
			$("#table").show();
			$("#navigation").show();
		}
		return false;
	});
	
	$("#confirm").click(function(){
		RC.topic.checkScratchTable();
		if ((RC.topic.importedExercises.length > 0) || RC.topic.addedExercises > 0) {
			$("#exercise-count").text( RC.topic.importedExercises.length || RC.topic.addedExercises );
			if (!RC.topic.rtl) {
				$("#rtl").hide();
			}
			$("#firstly").hide();
			$("#finally").show();
		} else {
			$(".message").text("Please add some exercises");
		}
		return false;
	});
	
	$("#topic_submit").click(function(){
		if ($("#topic_name").val() === '') {
			$(".message").text("Please add a topic name");
			return false;
		}
	});
	
});

