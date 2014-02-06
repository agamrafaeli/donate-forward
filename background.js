/*
waits for messages from content.js
when a messaged received, i use msg.totalNum to edit the extension icon and add the forms number on it.
*/

chrome.browserAction.setBadgeText({text:""});
chrome.runtime.onMessage.addListener(function(msg, sender) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "content") && msg.subject){
    	if (msg.subject === "donateForm"){
    		chrome.browserAction.setBadgeText({text:msg.totalNum+"", tabId: sender.tab.id});
    	}
    }
});