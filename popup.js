$(document).ready(function() {
	requestDonateForms();
});

function requestDonateForms(){
	chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(
                tabs[0].id,
                { from: "popup", subject: "getDonateFormsFromContent" },
                setDonateForm);
    });
}

/* Update the relevant fields with the new data */
function setDonateForm(donateForm) {
    $('.js-list table:first-child').append(donateForm);
	fix_aHref_links(donateForm);
}

function fix_aHref_links(element){
	$('.js-list').find('a > img').each(function(){
		$(this).click(function(evt) {
			var img = this;
			chrome.tabs.query({
	        active: true,
	        currentWindow: true
	    	}, function(tabs) {
	        	chrome.tabs.sendMessage(
	                tabs[0].id,
	                { from: "popup", subject: "openPage", data: img.parentNode+"" }, function () {});
	    		});
			window.close();
        });
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "content") && msg.subject){
    	if (msg.subject === "donateForm"){
    		setDonateForm(msg.data);
    	}
    }
});