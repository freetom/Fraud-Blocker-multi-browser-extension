var blockedTitle='FraudBlocker Protection';
if(document.title!=blockedTitle)
  chrome.runtime.sendMessage(
    { msg:'check' },
    function(msg){
      if(msg==null) return;
      if(msg.msg=='black'){
        initBlack(msg.ns);
      }
    }
  );  



function initBlack(ns) {
  
  //check that the domain match to prevent race conditions if the user changes/opens tabs quickly
  if(document.domain.indexOf(ns)==-1)
    return;
    
  //fix for pages that instead of a BODY has a FRAMESET
  if(document.body.tagName=='FRAMESET'){
    var x=document.getElementsByTagName("frameset")[0];
    x.remove();
  }

  //go with common procedure of clean-up
  var htmlEl = document.getElementsByTagName("html")[0];
  htmlEl.removeChild(document.getElementsByTagName("head")[0])
  var el = document.createElement("head");
  htmlEl.appendChild(el);
  document.title=blockedTitle;


  document.body=document.createElement('body');
  
  var iframe = document.createElement("iframe");
  iframe.setAttribute("src", chrome.runtime.getURL("web/black.html"));
  iframe.setAttribute("style", "position: fixed; top: 0; left: 0; z-index: 10000; width: 100%; height: 100%;");
  iframe.setAttribute("frameBorder","0");

  
  document.body.appendChild(iframe);

}
