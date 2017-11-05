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

//setup handler to block black-listed sites
function onBeforeRequest(request){
  if(getStatus(request.url).msg=="black") //----------BLOCK-IT----------
    // Redirect the browser to the "placeholder" blocked-page
    // Furthermore, add the blocked URL to the end of the URL so we can retrieve
    // it later, in the case the user wants to ignore the block
    return {redirectUrl: chrome.extension.getURL('web/black.html?'+encodeURIComponent(request.url))};
}
chrome.webRequest.onBeforeRequest.addListener(onBeforeRequest, {urls: ["<all_urls>"]}, ["blocking"]);


storage.get(null,init);
