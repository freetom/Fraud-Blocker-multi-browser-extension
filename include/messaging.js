
function updateLocalList(ns,add){
  if(add)
    localList[ns]=1;
  else
  	delete localList[ns];
  storage.set({local: JSON.stringify(localList)});
  if(chrome.runtime.lastError)
    console.log(chrome.runtime.lastError);
}

function updateLocalConList(ns,add){
	if(add)
		localConList[ns]=1;
	else
		delete localConList[ns];
	storage.set({localCon: JSON.stringify(localConList)});
}

function getStatus(url){
  var ret={}, prec=null, current='', level=2, ns=extractNS(url);
  while(prec!=current){
    prec=current;
    ret.ns=current=extractSubNS(ns,level++);
    
    if(localList[current]!=null)
      ret.local=true;
    else if(localConList[current]!=null)
      ret.conLocal=true;

    if(whiteList[current]!=null){
        ret.msg= "white";
        break;
      }
    else if(blackList[current]!=null){
        if(blackListIgnore[current]!=null)
          ret.msg="ignored";
        else
          ret.msg= "black";
        break;
    }
    else if(greyList[current]!=null){
        ret.msg= "grey";
        ret.nFraud=greyList[current].reports;
        ret.nGood=greyList[current].contro_reports;
        break;
    }
    else{
      ret.msg="";
      continue;
    }
  }
  return ret;
}
/*
 *  Identify how the site on the current tab is recognized by the local database.
 *  The procedure is the following:
 *  If the domain to check is fun.links.co.uk,
 *  First is checked co.uk, if there's a FLAG for it, the function terminates. 
 *  If there's nothing the function continues with links.co.uk .. etc ..
 *
 *  This is the best way I figured out to detect determined domains based on NS structure.
*/
function notify(sendResponse){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	var ret=getStatus(tabs[0].url);
      sendResponse(ret);
    });
}

function sendGET(url, ns){
	try{
		var request = new XMLHttpRequest();
		request.open("GET", url+'?ns='+ns, false);
		request.send();
		return request.responseText;
	}
	catch(ex){	return "fail";	}
}

var blackListIgnore={};
var performing=false;
function messageHandler( msg, sender, sendResponse ){
	if(msg.msg=="check"){
		notify(sendResponse);
	}
	else if(msg.msg=='ignore'){
		blackListIgnore[msg.element]=1;
		chrome.tabs.reload();
	}
	else{
		if(performing)
			return false;
		performing=true;

    var ret=getStatus(msg.ns);
    msg.ns=ret.ns;

		var URL=null;
		var add=null;	//true when adding to tables, false when removing (avoiding reports)
		var con=false;	//true when reporting site as non-fraudulent
		var request = new XMLHttpRequest();
	  if(msg.type=='report'){
			URL=reportUrl;
			add=true;
		}
		else if(msg.type=='avoidReport'){
			URL=avoidReportUrl;
			add=false;
	  }
	  else if(msg.type=='conReport'){
	  	con=true;
	   	URL=conReportUrl;
		  add=true;
	  }
	  else if(msg.type=='avoidConReport'){
	  	con=true;
	  	URL=avoidConReportUrl;
			add=false;
	  }
    else if(msg.type=='avoidAny'){
      var failed=false;
      if(localList[msg.ns]!=null){
        URL=avoidReportUrl;
        add=false;
      }
      else if(localConList[msg.ns]!=null){
        con=true;
        URL=avoidConReportUrl;
        add=false;
      }
      else
        failed=true;
      if(failed){
        sendResponse({result: 'fail'});
        performing=false;
        return true;
      }
    }
	  if ( (con && ((add && localConList[msg.ns]!=null) || (!add && localConList[msg.ns]==null)) ) ||
	   	 (!con && ((add && localList[msg.ns]!=null) || (!add && localList[msg.ns]==null)) )){
		  sendResponse({result: 'fail'});
		}
		else{
		  var response = sendGET(URL,msg.ns);
			if(response.indexOf('ok') != -1){
        msg.ns = response.split(" ")[1];
				if(con){
					updateLocalConList(msg.ns,add);
					if(localList[msg.ns]!=null){
						if(sendGET(avoidReportUrl,msg.ns).indexOf('ok')!=-1)
							updateLocalList(msg.ns,false);
						else{
							updateLocalConList(msg.ns,!add);
							sendResponse({result: 'fail'});
              performing=false;
							return true;
						}
					}
				}
				else{
					updateLocalList(msg.ns,add);
					if(localConList[msg.ns]!=null){
						if(sendGET(avoidConReportUrl,msg.ns).indexOf('ok')!=-1)
							updateLocalConList(msg.ns,false);
						else{
							updateLocalList(msg.ns,!add);
							sendResponse({result: 'fail'});
              performing=false;
							return true;
						}
					}
				}
				sendResponse({result: 'ok', ns: msg.ns});
			}
			else{
				sendResponse({result: 'fail'});
			  //document.write(response+'<br>'+currentNS);
			}
		}
		performing=false;
	}
	return true;	//return true if sendResponse run after the function returns
}

