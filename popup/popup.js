
var currentNS='';

document.addEventListener("DOMContentLoaded",mapEvents);

init();

function ignore(){
  chrome.runtime.sendMessage(
    { msg:'ignore', element:currentNS }
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
      
      if(document.getElementById('offline').style.display!='none')
        document.getElementById('offline').style.display='none';

      pageCheck();

      updateDiv('url',currentNS);
      if(document.getElementById('default').style.visibility!='visible')
        document.getElementById('default').style.visibility='visible';
    }
  });
}

var reporting=false;
function reportFraud(){
  //already selected?
  if(document.getElementById('grey').style.display!='none' &&
    document.getElementById('fraudulent').style.borderColor=='red')
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'report', ns: currentNS},
    function(msg){
      if(msg.result=='ok'){
        if(document.getElementById('grey').style.display=='none')
          setView('none','block','none');
        else{
          document.getElementById('fraudulent').style.borderColor='red';
          document.getElementById('non-fraudulent').style.borderColor='#060606';
          document.getElementById('dontknow').style.borderColor='#060606';
          updateTab();
        }
      }
      else if(msg.result=='timeout'){
        if(document.getElementById('grey').style.display!='none')
          document.getElementById('grey').style.display='none';
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
    {type: 'avoidReport', ns: currentNS},
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
  if(document.getElementById('grey').style.display!='none' &&
    document.getElementById('non-fraudulent').style.borderColor=='red')
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'conReport', ns: currentNS},
    function(msg){
      if(msg!=null){
        if(msg.result=='ok'){
          document.getElementById('fraudulent').style.borderColor='#060606';
          document.getElementById('non-fraudulent').style.borderColor='red';
          document.getElementById('dontknow').style.borderColor='#060606';
          updateTab();
        }
        else if(msg.result=='timeout'){
          if(document.getElementById('grey').style.display!='none')
            document.getElementById('grey').style.display='none';
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
    {type: 'avoidConReport', ns: currentNS},
    function(msg){
      updateTab();
      reporting=false;
    }
  );
}

function avoidAny(){
  if(document.getElementById('grey').style.display!='none' &&
    document.getElementById('dontknow').style.borderColor=='red')
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'avoidAny', ns: currentNS},
    function(msg){
      if(msg!=null){
        if(msg.result=='ok'){
          document.getElementById('fraudulent').style.borderColor='#060606';
          document.getElementById('non-fraudulent').style.borderColor='#060606';
          document.getElementById('dontknow').style.borderColor='red';

          updateTab();
        }
        else if(msg.result=='timeout'){
          if(document.getElementById('grey').style.display!='none')
            document.getElementById('grey').style.display='none';
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
