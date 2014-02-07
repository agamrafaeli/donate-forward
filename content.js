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
	$.ajax({
			url: "https://www.google.co.il/search?q=site:"+domain+"+paypal+donate",
			dataType: "html",
			success: function(data) {
				var firstLinkIndex = data.indexOf("http://"+domain);
				if (firstLinkIndex!=-1){
					var LinkLength = data.indexOf('"', firstLinkIndex) - firstLinkIndex;
					var urlWithDonateForm = data.substr(firstLinkIndex, LinkLength);
					//alert("i've found this link with google: "+urlWithDonateForm);
					scanDonateFormsInLink(urlWithDonateForm, onGoogleFirstLinkScanEnd);
				}else{
					scanAllLinks();
				}
				
			}
		});
});

function onGoogleFirstLinkScanEnd(result){
	if (!result){
		scanAllLinks();
	}else{
		//alert("found it! good.. so i don't read more links");
	}
}

function scanAllLinks(){
	//alert("scanning all links :(");
	$("a[href]").each(function(index,value) {
		scanDonateFormsInLink(value.href, function() {});
	})
}

function scanDonateFormsInLink(url, callback){
	$.ajax({
		url: url,
		dataType: "html",
		success: function(data) {
			var foundForm = false;
			$($(data)).find("form[action='https://www.paypal.com/cgi-bin/webscr'], a[href^='https://www.paypal.com/cgi-bin/webscr']").each(function() {
				foundForm = true;
                if ($(this).is("form")) {
    				var inputs = $(this).find(':input');
    				$(this).empty().append(inputs);
                }
				var formattedForm = reformatDonateForm(this);
				allDonateForms.push(formattedForm);
		        chrome.runtime.sendMessage({
				    from: "content",
				    subject: "donateForm",
				    data: $(this)[0].outerHTML,
				    totalNum: allDonateForms.length
				});
			});
			callback(foundForm);
		}
	});
}

function reformatDonateForm(donateFormOb){
	console.log($(donateFormOb)[0].outerHTML);
    var outputElement;

    if ($(donateFormOb).is("form")) {
    	$(donateFormOb).remove('[name="amount"]');
    	var itemNameOb = $(donateFormOb).find('[name="item_name"]').removeAttr("type").wrap('<td class="desc-cell"></td>');
    	$(itemNameOb).after(
    '<td class="dollar-cell">$</td>\
    <td><input id="amount" type="text" maxlength="8" name="amount" size="9"></td>\
    <td><input id="newSubmit" type="image" alt="Make payments with PayPal, it\'s fast, free, and secure!" name="submit" src="http://c65f1acec71474d68bba-2f93ff0e2daf8223612b6ebd94ef7653.r95.cf2.rackcdn.com/dlf/en/images/paypal-donate-button.png"></td>');
    	
    	$(donateFormOb).find(".newSubmit").attr("onClick", $(donateFormOb).find("input[type='image']").eq(0).attr("onClick"));
        outputElement = "<tr>"+$(donateFormOb)[0].outerHTML+"</tr>";

    } else {
        var link_img = $(donateFormOb).find('img');
        link_img.attr('src', link_img.prop('src'));
        var domain = document.location.hostname;
        outputElement = '<tr><td class="desc-cell">' + domain + '</td><td class="dollar-cell"></td>\
        <td></td><td>' + $(donateFormOb)[0].outerHTML + '</td></tr>';
    }
	return outputElement;
}