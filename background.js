//setup message handler for requests coming from popup (toolbar button) and content_scripts
chrome.runtime.onMessage.addListener(messageHandler);

//setup handler to inject content in 'black' and 'grey' pages
chrome.tabs.onActivated.addListener(function(){
    chrome.tabs.executeScript(null,{file:"content_script.js"});
});


storage.get(null,init);
