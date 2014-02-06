$(document).ready(function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        chrome.tabs.sendMessage(
                tabs[0].id,
                { from: "popup", subject: "URLSInfo" },
                setURLSInfo);
    });
});

/* Update the relevant fields with the new data */
function setURLSInfo(forms) {
    $('.js-list').html(forms);
}
