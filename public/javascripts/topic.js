
RC.topic = {
	
	importedExercises: [],
	addedExercises: 0,
	warning: '',
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
					this.warning = "Incomplete exercise on line " + i;
					return false;
				}
				this.rtl_check(response);
				this.importedExercises.push([phrase, response, hint ? hint : '']);
			}
		}
		if (this.importedExercises.length > 0) {
			this.warning = "";
			return true;
		} else {
			this.warning = "Please enter some data";
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
				var rowNo = i + 1;
				var row = "<tr>" +
									"<td>" + rowNo + "</td>" +
									"<td>" + this.importedExercises[i][0] + "</td>" +
									"<td>" + this.importedExercises[i][1] + "</td>" +
									"<td>" + this.importedExercises[i][2] + "</td>" +
									"<td> </td>" +
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
	
	$("#hint-help").click(function() {
		alert("Nothing here yet");
		return false;
	});

	$("#add-exercise").click(function() {
		RC.table.appendRow();
	});

	$("#choose-import").children("input:radio").click();
	$("#table").hide();
	$("#finally").hide();

	$("#choose-import").click(function() {
		$("#table").hide();
		$("#topic-import").show();
		return false;
	});

	$("#choose-table").click(function() {
		$("#topic-import").hide();
		$("#navigation").hide();
		$("#table").show();
		RC.table.display();
		return false;
	});

	$("#import-data").focus(function() {
		if ($(this).hasClass("disabled")) {
			$(this).val("");
			$(this).removeClass("disabled");
		}
	});

	// click inside append-to-list to add list-item to list
	$("#add-item").click(function() {
		$("#list-template").children().clone().appendTo("#list");
		return false;
	});
	
	$("#parse-import-data").click(function(){
		if ( RC.topic.parse( $("#import-data").val() ) ) {
			RC.topic.addImportedData();
			RC.table.init('#exercises', 15);
			RC.table.display();
			$("#choose").hide();
			$("#topic-import").hide();
			$("#table").show();
			$("#navigation").show();
		}
		$(".warning").text(RC.topic.warning);
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
			$(".warning").text("Please add a topic name");
			$("#finally").show();
		} else {
			$(".warning").text("Please add some exercises");
		}
		return false;
	});
	
	$("#topic_submit").click(function(){
		if ($("#topic_name").val() === '') {
			return false;
		}
	});
	
	$("#add-exercise").click(function() {
		
	});
	
});

