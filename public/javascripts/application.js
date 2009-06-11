var RC = {};

RC.table = {
	
	offset: 0,
	limit: 1,
	tableSize: 0,
	tbodyId: "",
	navigationId: "#navigation",
	downId: "#down",
	upId: "#up",
	
	debug: function() {
		alert(this.tableSize + ' : ' + this.offset + ' : ' + this.limit );
	},
	
	init: function(tbodyId, limit) {
		this.tbodyId = tbodyId;
		this.limit = limit;
		this.tableSize = $("tr", this.tbodyId).length;
		this.display();
	},
	
	down: function() {
		this.offset += this.limit;
		this.display();
	},
	
	up: function() {
		this.offset -= this.limit;
		this.display();
	},
	
	tail: function() {
		if (this.tableSize > this.offset + this.limit) {
			this.offset = this.tableSize - this.tableSize % this.limit;
			this.display();
		}
	},

	navigation: function() {
		if (this.tableSize > this.offset + this.limit ) {
			$(this.downId).removeClass("disabled");
		} else {
			$(this.downId).addClass("disabled");
			$(this.downId).removeClass("ready");
		}
		if (this.offset > 0 ) {
			$(this.upId).removeClass("disabled");
		} else {
			$(this.upId).addClass("disabled");
			$(this.upId).removeClass("ready");
		}
	},
	
	display: function() {
		$("tr", this.tbodyId).hide();
		$("tr", this.tbodyId).slice(this.offset, this.offset + this.limit).show();
		if (this.tableSize > this.limit) {
			$(this.navigationId).show();
			this.navigation();
		}
		$(this.tbodyId).show();
	},
	
	appendRow: function() {
		$("tr:last", this.tbodyId).clone().appendTo(this.tbodyId);
		this.tableSize += 1;
		this.tail();
	}

};

$(document).ready(function(){
	
	if ($('#topics').length) {
		RC.table.init('#topics', 16);
	} else if ($('#subjects').length) {
		RC.table.init('#subjects', 16);
	} else if ($('#courses').length) {
		RC.table.init('#courses', 12);
	} else if ($('#exercises').length) {
		RC.table.init('#exercises', 12);
	} else if ($('#course-topics').length) {
		RC.table.init('#course-topics', 13);
	}
	
	
	$("#down").click(function() {
		if (!$(this).hasClass("disabled")) {
			RC.table.down();
		}
	});
	
	$("#up").click(function() {
		if (!$(this).hasClass("disabled")) {
			RC.table.up();
		}
	});
	
	$(".button").mouseover(function() {
		if (!$(this).hasClass("disabled")) {
			$(this).addClass("ready");
		}
	});

	$(".button").mouseout(function() {
		if (!$(this).hasClass("disabled")) {
			$(this).removeClass("ready");
		}
	});
	
	$(".radio").click(function() {
		$(".radio").removeClass("go");
		if (!$(this).hasClass("disabled")) {
			$(this).children("input:radio").click();
			$(this).addClass("go");
		}
	});

	$(".checkbox").click(function() {
		if (!$(this).hasClass("disabled")) {
			var checkbox = $("input:checkbox:first", this);
			if (checkbox.attr("checked")) {
				checkbox.attr("checked", false);
				$(this).removeClass("go");
			} else {
				checkbox.attr("checked", true);
				$(this).addClass("go");
			}
		}
	});

	$('.toggle-switch').change(function() {
		$('.toggle').toggle();
	});
	
	$('.display-on-change').change(function() {
		var txt = $('.display-on-change :selected').text();
		$('.display-changed').text(txt);
	});
	
});