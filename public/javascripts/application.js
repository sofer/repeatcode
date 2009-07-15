var RC = {};

RC.table = {
	
	offset: 0,
	limit: 12,
	tableSize: 0,
	tableId: ".paging:first",
	navigationId: "#table-navigation",
	downId: "#down",
	upId: "#up",
	
	debug: function() {
		alert(this.tableSize + ' : ' + this.offset + ' : ' + this.limit );
	},
	
	init: function() {
		this.limit = parseInt($(this.tableId).attr("limit"), 10);
		this.tableSize = $("tr", this.tableId).length;
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
		if (this.tableSize <= this.limit) {
			$(this.navigationId).hide();
		} else {
			$(this.navigationId).show();
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
		}
	},
	
	display: function() {
		$("tr", this.tableId).hide();
		$("tr", this.tableId).slice(this.offset, this.offset + this.limit).show();
		this.navigation();
	},
	
	appendRow: function() {
		$(".paging tr:last").clone().appendTo(this.tableId);
		this.tableSize += 1;
		this.tail();
	}

};

$(document).ready(function(){
	
	RC.table.init();
	
	$(".display").click(function() {
		var displayId = $(this).attr("display");
		$(displayId).fadeIn();
		$(":submit", displayId).focus();
		return false;
	});
	
	$(".display-box").click(function() {
		$(".display-box").fadeOut();
		return false;
	});

	
	
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
	
	$(".radio").click(function() {
		$(".radio").removeClass("radio-selected");
		if (!$(this).hasClass("disabled")) {
			$(this).children("input:radio").click();
			$(this).addClass("radio-selected");
		}
	});

	$(".checkbox").click(function() {
		if (!$(this).hasClass("disabled")) {
			var checkbox = $("input:checkbox:first", this);
			if (checkbox.attr("checked")) {
				checkbox.attr("checked", false);
				$(this).removeClass("checkbox-selected");
			} else {
				checkbox.attr("checked", true);
				$(this).addClass("checkbox-selected");
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
	
	$('#account form').submit(function(){
		if ($('#user_login').val() === '') {
			$('.warning').text('Please enter a login')
			return false;
		} else {
			return true;
		}
	});
	
	$('.archive-alert').click(function(){
		if (!confirm('Remove permanently?')) {
			return false;
		} else {
			return true;
		}
	});
	
});