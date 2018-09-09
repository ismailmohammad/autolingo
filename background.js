// TODO: Script replace in react app:
// chrome-extension://lgghdoicfikanikdfnffdfiogobiaaek/react-app/build/static/js/main.87c135b1.js

chrome.getExtensionId()

(function () {
    chrome.browserAction.onClicked.addListener(function(tab) {
        chrome.tabs.create({url: ""})
    })
});
