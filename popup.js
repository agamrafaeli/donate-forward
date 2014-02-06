$(document).ready(function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(
                tabs[0].id,
                { from: "popup", subject: "getDonateFormsFromContent" },
                setDonateForm);
    });
});

/* Update the relevant fields with the new data */
function setDonateForm(donateForm) {
    $('.js-list').append(donateForm);
}

chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "content") && msg.subject){
    	if (msg.subject === "donateForm"){
    		setDonateForm(msg.data);
    	}
    }
});