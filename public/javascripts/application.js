$(document).ready(function(){

	$('.toggle-switch').change(function() {
		$('.toggle').toggle();
	});
	
	$('.display-on-change').change(function() {
		var txt = $('.display-on-change :selected').text();
		$('.display-changed').text(txt);
	});
	
	$('#org').change(function() {
		document.location = '/organizations/' + $(this).val() + '/users/new';
	});
	
});