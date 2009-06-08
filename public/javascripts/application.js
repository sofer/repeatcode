var RC = {};

RC.table = {
	
	offset: 0,
	limit: 1,
	tableSize: 0,
	tbodyId: "",
	downId: "#down",
	upId: "#up",
	
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
		$("tr", this.tbodyId).hide();
		$("tr", this.tbodyId).slice(this.offset, this.offset + this.limit).show();
		this.navigation();
		$(this.tbodyId).show();
	},
	
	appendRow: function() {
		$("tr:last", this.tbodyId).clone().appendTo(this.tbodyId);
		this.tableSize += 1;
		this.tail();
	}

};

$(document).ready(function(){
	
	$(".button").mouseover(function() {
		$(this).addClass("ready");
	});

	$(".button").mouseout(function() {
		$(this).removeClass("ready");
	});
	
	$(".radio").click(function() {
		$(".radio").removeClass("go");
		$(this).children("input:radio").click();
		$(this).addClass("go");
	});

	$(".checkbox").click(function() {
		var checkbox = $("input:checkbox:first", this);
		if (checkbox.attr("checked")) {
			checkbox.attr("checked", false);
			$(this).removeClass("go");
		} else {
			checkbox.attr("checked", true);
			$(this).addClass("go");
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