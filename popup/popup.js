
var currentNS='', currentURL='';

document.addEventListener("DOMContentLoaded",mapEvents);

init();

function ignore(){
  chrome.runtime.sendMessage(
    { msg:'ignore', element:currentNS, url: currentURL }
  );
  window.close();
}

function pageCheck(){
  chrome.runtime.sendMessage({msg:'check'},checkURL);
}

function init(){
  chrome.tabs.onActivated.addListener(updateTab);
  updateTab();
}

/*  Get the url of the current active tab and update the popup with the new url
*/
function updateTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      currentNS=extractNS(currentTab.url);
      currentURL = currentTab.url;

      if(checkDisplay('offline','none'))
        setDisplay('offline','none')

      pageCheck();

      updateDiv('url',currentNS);
      if(checkVisibility('default','visible'))
        setVisibility('default','visible')
    }
  });
}

var reporting=false;
function reportFraud(){
  //already selected?
  if( checkDisplay('grey','none') && checkSelected('fraudulent') )
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'report', ns: currentNS, url: currentURL},
    function(msg){
      if(msg.result=='ok'){
        if(checkDisplay('grey','block'))
          setView('none','block','none');
        else{
          setSelected('fraudulent')
          setUnselected('non-fraudulent')
          setUnselected('dontknow')
          updateTab();
        }
      }
      else if(msg.result=='timeout'){
        if(checkDisplay('grey','none'))
          setDisplay('grey','none');
        showOffline();
      }
      reporting=false;
    }
  );
}

function avoidReport(){
  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'avoidReport', ns: currentNS, url: currentURL},
    function(msg){
      if(msg.result=='ok'){
        setView('block','none','none');
      }
      else if(msg.result=='timeout'){
        showOffline();
      }
      reporting=false;
    }
  );
}

function conReport(){
  //already reported?
  if(checkDisplay('grey','none') && checkSelected('non-fraudulent'))
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'conReport', ns: currentNS, url: currentURL},
    function(msg){
      if(msg!=null){
        if(msg.result=='ok'){
          setUnselected('fraudulent')
          setSelected('non-fraudulent')
          setUnselected('dontknow')
          updateTab();
        }
        else if(msg.result=='timeout'){
          if(checkDisplay('grey','none'))
            setDisplay('grey','none');
          showOffline();
        }
        reporting=false;
      }
    }
  );
}

function avoidConReport(){
  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'avoidConReport', ns: currentNS, url: currentURL},
    function(msg){
      updateTab();
      reporting=false;
    }
  );
}

function avoidAny(){
  if(checkDisplay('grey','none') && checkSelected('dontknow','red'))
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'avoidAny', ns: currentNS, url: currentURL},
    function(msg){
      if(msg!=null){
        if(msg.result=='ok'){
          setUnselected('fraudulent')
          setUnselected('non-fraudulent')
          setSelected('dontknow')

          updateTab();
        }
        else if(msg.result=='timeout'){
          if(checkDisplay('grey','none'))
            setDisplay('grey','none');
          showOffline();
        }
      }
      reporting=false;
    }
  );
}

function mapEvents(){
  document.getElementById("report").addEventListener("click",reportFraud);
  document.getElementById("avoidReport").addEventListener("click",avoidReport);
  document.getElementById("fraudulent").addEventListener("click",reportFraud);
  document.getElementById("non-fraudulent").addEventListener("click",conReport);
  document.getElementById("dontknow").addEventListener("click",avoidAny);
  document.getElementById("ignore").addEventListener("click",ignore);
}
