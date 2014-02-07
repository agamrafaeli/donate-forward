var allDonateForms = [];
var blacklist = ["google.com", "yahoo.com", "bing.com"];
/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup") && msg.subject){
        if (msg.subject === "getDonateFormsFromContent") {
	        response(allDonateForms);
	    }else if(msg.subject === "openPage"){
	    	window.location = msg.data;
	    }
    }
});



$(document).ready(function ()
{
	var domain = document.location.hostname;
    var filter = false;

    // Check if domain needs to be filtered
    for (var i = 0; i < blacklist.length; i=i+1) {
        if (domain.substring(domain.length-blacklist[i].length) == blacklist[i]) {
            filter = true;
        }
    }
    if (!filter) {

        // Search current page
        scanDonateFormsInLink(document.location, onCurrentPageScanEnd);
    }
});

function onCurrentPageScanEnd(result) {
    if (!result) {

        // Scan hostname's first link on google
        scanGoogleFirstLink(document.location.hostname);
    }
}

function scanGoogleFirstLink(domain) {
    $.ajax({
            url: "https://www.google.co.il/search?q=site:" + domain + "+paypal+donate",
            dataType: "html",
            success: function(data) {
                var firstLinkIndex = data.indexOf("http://" + domain);
                if (firstLinkIndex!=-1) {
                    var LinkLength = data.indexOf('"', firstLinkIndex) - firstLinkIndex;
                    var urlWithDonateForm = data.substr(firstLinkIndex, LinkLength);
                    scanDonateFormsInLink(urlWithDonateForm, onGoogleFirstLinkScanEnd);
                } else {

                    // If nothing found, scan all links
                    scanAllLinks();
                }
                
            }
        });
}

function onGoogleFirstLinkScanEnd(result) {
	if (!result) {

        // If nothing found, scan all links
		scanAllLinks();
	}
}

function scanAllLinks() {
    var hostnames = [];
	$("a[href]").each(function(index,value) {
        if (jQuery.inArray(this.hostname, hostnames) == -1) {
            hostnames.push(this.hostname);
            scanDonateFormsInLink(value.href, function() {});
        }
	})
}

function scanDonateFormsInLink(url, callback) {
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
        var currency = new RegExp('[\\?&]currency_code=([^&#]*)').exec(donateFormOb.href);
        var currency_str = (!currency) ? "" : (", " + currency[1]);
        outputElement = '<tr><td class="desc-cell">' + domain + currency_str + '</td><td class="dollar-cell"></td>\
        <td></td><td>' + $(donateFormOb)[0].outerHTML + '</td></tr>';
    }
	return outputElement;
}