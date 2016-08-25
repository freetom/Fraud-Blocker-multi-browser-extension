
var currentNS='';
var localList=null;
var localConList=null;

//storage.clear();
storage.get(null,init);

function ignore(){
  chrome.runtime.sendMessage(
    { msg:'ignore', element:currentNS }
  );  
  window.close();
}



function pageCheck(){
  chrome.runtime.sendMessage({msg:'check'},checkURL); 
}

function init(result){
  if (chrome.runtime.lastError) {
    console.log(chrome.runtime.lastError);
  } else {
    if(result.local==null){
      localList={};
      storage.set({local: localList});
    }
    else{
      localList=parseObj(result.local);
    }

    if(result.localCon==null){
      localConList={};
      storage.set({localCon: localConList});
    }
    else{
      localConList=parseObj(result.localCon);
    }
  }
  chrome.tabs.onActivated.addListener(updateTab);
  updateTab();

}


function setView(default_, thanks, already){  
  if(document.getElementById('default').style.display!=default_)
    document.getElementById('default').style.display=default_;
  if(document.getElementById('thanks').style.display!=thanks)
    document.getElementById('thanks').style.display=thanks;
  if(document.getElementById('already').style.display!=already)
    document.getElementById('already').style.display=already;
}

/*  Get the url of the current active tab and update the popup with the new url 
*/
function updateTab() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    if (tabs[0]) {
      currentTab = tabs[0];
      currentNS=extractNS(currentTab.url);
      
      if(pageCheck())
        setView('none','none','none');
      else if(localList[currentNS]!=null)
        setView('none','none','block');
      else
        setView('block','none','none');
      
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
    document.getElementById('fraudlent').style.borderColor=='red')
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'report', ns: currentNS},
    function(msg){
      if(msg.result=='ok'){
        localList[msg.ns]=1;
        if(document.getElementById('grey').style.display=='none')
          setView('none','block','none');
        else{
          if(document.getElementById('non-fraudlent').style.borderColor=='red'){
            document.getElementById('non-fraudlent').style.borderColor='#060606';
            delete localConList[msg.ns];
          }
          updateTab();
        }
        
        
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
        delete localList[msg.ns];
      }
      reporting=false;
    }
  );
}

function conReport(){
  //already reported?
  if(document.getElementById('grey').style.display!='none' &&
    document.getElementById('non-fraudlent').style.borderColor=='red')
    return;

  if(reporting)
    return;
  reporting=true;

  chrome.runtime.sendMessage(
    {type: 'conReport', ns: currentNS},
    function(msg){
      if(msg.result=='ok'){
        localConList[msg.ns]=1;
        if(document.getElementById('fraudlent').style.borderColor=='red'){
          document.getElementById('fraudlent').style.borderColor='#060606';
          delete localList[msg.ns];
        }
        updateTab();
      }
      reporting=false;
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
      if(msg.result=='ok'){
        delete localConList[msg.ns];
        updateTab();
      }
      reporting=false;
    }
  );
}

