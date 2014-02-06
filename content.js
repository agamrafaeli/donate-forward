var urls;

$(document).ready(function ()
{

	$("a[href]").each(function(index,value) {
		$.ajax({
			url: value.href,
			dataType: "html",
			success: function(data) {
				$($(data)).find("form[action='https://www.paypal.com/cgi-bin/webscr']").each(function() {
					var inputs = $(this).find('input');
					$(this).empty().append(inputs);
					alert($(this)[0].outerHTML);
				});
			}
		});
	})
});

function parseOldForm(oldForm) {

}


/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup")
            && msg.subject && (msg.subject === "URLSInfo")) {
        response(urls);
    }
});
