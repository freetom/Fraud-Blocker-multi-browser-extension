var blockedTitle='FraudBlocker Protection';
if(document.title!=blockedTitle && document.getElementById("greyPageToolbar")==null)
  chrome.runtime.sendMessage(
    { msg:'check' },
    function(msg){
      if(msg.msg=='black'){
        initBlack(msg.ns);
      }
      else if(msg.msg=='grey'){
        initGrey(msg.nFraud,msg.nGood,msg.ns);
      }
    }
  );  



function initBlack(ns) {
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

  //check that the domain match to prevent race conditions if the user changes/opens tabs quickly
  if(document.domain.indexOf(ns)!=-1)
    document.body.appendChild(iframe);

}

function initGrey(nReportsFraud,nReportsGood, ns){
  var div = document.createElement("div");
  div.setAttribute("id","greyPageToolbar");
  fontSizePx=14;
  if(window.screen.availWidth==1024)
    fontSizePx=11;
  else if(window.screen.availWidth<=800)
    fontSizePx=8;
  div.innerHTML='<img src="'+chrome.runtime.getURL('icons/fraud-200.png')+'" width="30px" height="30px" style="display:inline;vertical-align:middle;width:30px;height:30px;">      <span style="vertical-align: middle;display:inline;font-weight: bold;font-size: '+fontSizePx+'px;margin-top:50%;">'+nReportsFraud+' users had reported this site as Fraudulent. '+nReportsGood+' has reported it as Non-Fraudulent. Click  the Fraud Blocker icon (on Toolbar) to express your opinion about it</span><button onclick="document.getElementById(\'greyPageToolbar\').style.display=\'none\';" style="float:right;margin-right:2%;outline:none;background-color: Transparent;border-color:black;margin-top:3px;"><b>x</b></button>';

  div.setAttribute("style", "all: initial; display:inline-block;position: fixed; top: 0; left: 0; z-index: 2147483647; width: 100%; height: 36px;overflow: hidden;color: black;background: rgba(255,255,255,0.9);-webkit-touch-callout: none; /* iOS Safari */  -webkit-user-select: none;   /* Chrome/Safari/Opera */  -khtml-user-select: none;    /* Konqueror */  -moz-user-select: none;      /* Firefox */  -ms-user-select: none;       /* Internet Explorer/Edge */  user-select: none; border-style:outset; ");
  
  //check that the domain match to prevent race conditions if the user changes/opens tabs quickly
  if(document.domain.indexOf(ns)!=-1){
    if(document.body.tagName=='FRAMESET'){
      var x=document.getElementsByTagName("frameset")[0];
      var y=x.cloneNode(true);
      x.remove();
      document.body=document.createElement("body");
      document.body.appendChild(y);
    }
    document.body.appendChild(div);
  }
}
