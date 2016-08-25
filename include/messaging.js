
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

function notify(sendResponse){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    	var ret={};
        current=extractNS(tabs[0].url);
        if(whiteList[current]!=null)
            ret.msg= "white";
        else if(blackList[current]!=null){
            if(blackListIgnore[current]!=null)
            	ret.msg="ignored";
            else
            	ret.msg= "black";
        }
        else if(greyList[current]!=null){
            ret.msg= "grey";
            ret.nFraud=greyList[current].reports;
            ret.nGood=greyList[current].contro_reports;
        }
        else
        	ret.msg="";
        ret.ns=current;
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
		var URL=null;
		var add=null;	//true when adding to tables, false when removing (avoiding reports)
		var con=false;	//true when reporting site as non-fraudlent
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
	    if ( (con && ((add && localConList[msg.ns]!=null) || (!add && localConList[msg.ns]==null)) ) ||
	    	(!con && ((add && localList[msg.ns]!=null) || (!add && localList[msg.ns]==null)) )){
			sendResponse({result: 'fail'});
		}
		else{
		    var response = sendGET(URL,msg.ns);
			if(response.contains('ok')){
				if(con){
					updateLocalConList(msg.ns,add);
					if(localList[msg.ns]!=null){
						if(sendGET(avoidReportUrl,msg.ns).contains('ok'))
							updateLocalList(msg.ns,false);
						else{
							updateLocalConList(msg.ns,!add);
							sendResponse({result: 'fail'});
							return true;
						}
					}
				}
				else{
					updateLocalList(msg.ns,add);
					if(localConList[msg.ns]!=null){
						if(sendGET(avoidConReportUrl,msg.ns).contains('ok'))
							updateLocalConList(msg.ns,false);
						else{
							updateLocalList(msg.ns,!add);
							sendResponse({result: 'fail'});
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

