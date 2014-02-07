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
				var inputs = $(this).find(':input');
				$(this).empty().append(inputs);
				var formattedForm = reformatDonateForm(this);
				allDonateForms.push(formattedForm);
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

function reformatDonateForm(donateFormOb){
	console.log($(donateFormOb)[0].outerHTML);
	$(itemNameOb).remove("#amount");
	var itemNameOb = $(donateFormOb).find('[name="item_name"]').removeAttr("type").wrap('<td class="desc-cell"></td>');
	$(itemNameOb).after(
'<td class="dollar-cell">$</td>\
<td><input id="amount" type="text" maxlength="8" name="amount" size="9"></td>\
<td><input id="newSubmit" type="image" alt="Make payments with PayPal, it\'s fast, free, and secure!" name="submit" src="http://c65f1acec71474d68bba-2f93ff0e2daf8223612b6ebd94ef7653.r95.cf2.rackcdn.com/dlf/en/images/paypal-donate-button.png"></td>');
	
	$(donateFormOb).find(".newSubmit").attr("onClick", $(donateFormOb).find("input[type='image']").eq(0).attr("onClick"));
	//var item_name = "";
	/*$(donateFormOb).find("input").each(function() {
		var inputName = $(this).attr("name");
		if (inputName == "item_name"){
			item_name = $(this).attr("value");
		//}else if(inputName == ){
		}else{
			$(this).attr("type", "hidden");
		}
	});
	alert(item_name);*/
	//$('<td class="desc-cell">'+item_name+'</td>').prependTo($(donateFormOb));
	//alert("<tr>"+$(donateFormOb)[0].outerHTML+"</tr>");
	var outputElement = "<tr>"+$(donateFormOb)[0].outerHTML+"</tr>";
	//alert(outputElement);
	return outputElement;
}