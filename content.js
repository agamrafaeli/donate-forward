$(document).ready(function ()
{
	links = $("a[href]")
	$("body").html("")

	.each(function(index,value) {
	$.ajax({
			url: value.href,
			dataType: "html",
			success: function(data) {
				$($(data)).find("form[action='https://www.paypal.com/cgi-bin/webscr']").each(function() {
					var inputs = $(this).find('input');
					$(this).empty().append(inputs);
					$("body").append($(this).html());
				});
			}
		});
	})
});

function parseOldForm(oldForm) {

}
