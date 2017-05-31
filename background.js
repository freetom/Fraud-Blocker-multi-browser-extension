//setup message handler for requests coming from popup (toolbar button) and content_scripts
chrome.runtime.onMessage.addListener(messageHandler);


function checkTab(info){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var res = getStatus(tabs[0].url);
    if(res.msg=="grey"){
      var nFraud=res.nFraud;
      if(isNaN(nFraud)) //sanitize
        nFraud='error';
      if(nFraud>0){
        chrome.browserAction.setBadgeText({tabId: tabs[0].tabId, text: nFraud});
        chrome.browserAction.setBadgeBackgroundColor({tabId: tabs[0].tabId, color: "#cc0000"});
      }
    }
    else
      chrome.browserAction.setBadgeText({tabId: tabs[0].tabId, text: ""});
  });
}

//setup handler to update browser action's badge text
chrome.tabs.onActivated.addListener(checkTab);
chrome.tabs.onUpdated.addListener(checkTab);


storage.get(null,init);
