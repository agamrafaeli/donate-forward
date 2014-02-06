var urls;

$(document).ready(function ()
{
	$('a').each(function(index,value) {
		urls+=value.href;
		//sendURL(value.href)
	})

});


function parseLinks(pageContent) {

}


/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(function(msg, sender, response) {
    /* First, validate the message's structure */
    if (msg.from && (msg.from === "popup")
            && msg.subject && (msg.subject === "URLSInfo")) {
        response(urls);
    }
});
