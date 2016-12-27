//setup message handler for requests coming from popup (toolbar button) and content_scripts
chrome.runtime.onMessage.addListener(messageHandler);

//setup handler to update browser action's badge text
chrome.tabs.onActivated.addListener(function(activeInfo){
  chrome.tabs.executeScript(null,{file:"content_script.js"});
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var res = getStatus(tabs[0].url);
    if(res.msg=="grey"){
      var nFraud=res.nFraud;
      if(isNaN(nFraud)) //sanitize
        nFraud='error';
      chrome.browserAction.setBadgeText({tabId: activeInfo.tabId, text: nFraud});
      chrome.browserAction.setBadgeBackgroundColor({tabId: activeInfo.tabId, color: "#cc0000"});
    }
  });
});

storage.get(null,init);
