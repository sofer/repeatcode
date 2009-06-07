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
	}

};


$(document).ready(function(){

	$('.toggle-switch').change(function() {
		$('.toggle').toggle();
	});
	
	$('.display-on-change').change(function() {
		var txt = $('.display-on-change :selected').text();
		$('.display-changed').text(txt);
	});
	
	$('#NOTINUSEorg').change(function() {
		document.location = '/organizations/' + $(this).val() + '/users/new';
	});
	
});