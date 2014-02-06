var allDonateForms = [];

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup")
            && msg.subject && (msg.subject === "getDonateFormsFromContent")) {
        response(allDonateForms);
    }
});



$(document).ready(function ()
{
	var domain = document.location.hostname;
	/*$.ajax({
			url: "https://www.google.co.il/search?q=site:"+domain+"+paypal+donate",
			dataType: "html",
			success: function(data) {
				var firstLinkIndex = data.indexOf("http://"+domain);
				var LinkLength = data.indexOf('"', firstLinkIndex) - firstLinkIndex;
				var urlWithDonateForm = data.substr(firstLinkIndex, LinkLength);
				scanDonateFormsInLink(urlWithDonateForm);
			}
		});
*/
	$("a[href]").each(function(index,value) {
		scanDonateFormsInLink(value.href);
	})
});


function scanDonateFormsInLink(url){
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data) {
			$($(data)).find("form[action='https://www.paypal.com/cgi-bin/webscr']").each(function() {
				var inputs = $(this).find('input');
				$(this).empty().append(inputs);
				allDonateForms.push($(this)[0].outerHTML);
		        chrome.runtime.sendMessage({
				    from: "content",
				    subject: "donateForm",
				    data: $(this)[0].outerHTML,
				    totalNum: allDonateForms.length
				});
			});
		}
	});
}
function parseOldForm(oldForm) {

}
