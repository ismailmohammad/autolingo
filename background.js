// TODO: Script replace in react app:
// chrome-extension://lgghdoicfikanikdfnffdfiogobiaaek/react-app/build/static/js/main.87c135b1.js

const getExtensionId = () => chrome.runtime.id;

chrome.browserAction.onClicked.addListener((tab) => {
    chrome.tabs.create({url: chrome.runtime.getURL("react-app/build/index.html")});
});
