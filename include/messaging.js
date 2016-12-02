
function updateLocalList(ns,add){
  if(add)
    localList[ns]=1;
  else
  	delete localList[ns];
  storage.set({local: JSON.stringify(localList)});
  //if(chrome.runtime.lastError)
  //  console.log(chrome.runtime.lastError);
}

function updateLocalConList(ns,add){
	if(add)
		localConList[ns]=1;
	else
		delete localConList[ns];
	storage.set({localCon: JSON.stringify(localConList)});
}

/*
 *  Given a url return the status of the page in the database.
 *  It checks from the SLD to the last domain
 *  The nameserver that match is returned as result.
 *  (This preserves the Hierarchic structure of DNS names)
 *  In other words, if a nameserver is bad, all his derivates 
 *  are bad too.
*/
function getStatus(url){
  var ret={}, prec=null, current='', level=2, ns=extractNS(url);
  //handle the empty case
  if(ns=="")
    return {ns:"",msg:"white"};
  //if visiting an IP instead of a NS, ignore it anyway
  if(/^(?!.*\.$)((?!0\d)(1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(ns) )
    return {ns:"",msg:"white"};
  
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

/*
 *  Send a GET request synchronously and return the responseText
*/
function sendGET(url, ns, func, onTimeout){	
	var request = new XMLHttpRequest();
  var type = (url==reportUrl)?0:(url==conReport)?1:(url==avoidReport)?2:(url==avoidConReport)?3:-1;
	request.open("GET", url+'?ns='+ns, true);
  request.timeout = reqDefaultTimeout;
  request.onload = function(){  func(request.responseText);   };
  request.ontimeout = function(){ onTimeout(ns, type); };
  request.onerror = function(){ onTimeout(ns, type); };
	request.send();
}

/*
 *  Function that runs on the background context and execute functions for content_script.js and
 *  for popup.js.
 *  Function performed are:
 *    +check a nameserver 
 *    +ignore black site for this session
 *    +report,avoidReport,controReport,avoidControReport
*/
var blackListIgnore={};
var performing=false;
function messageHandler( msg, sender, sendResponse ){
	if(msg.msg=="check"){
		notify(sendResponse);
	}
	else if(msg.msg=='ignore'){
		blackListIgnore[getStatus(msg.element).ns]=1;
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
		
    var onTimeout = function(ns, type){ 
      sendResponse({result: 'timeout'}); 

      var present=false,i=0;
      while(i<any_pending_reports.length){ //is it already in the list?
        if(any_pending_reports[i].report==ns){
          present=true;
          break;
        }
        i++;
      }

      if(!present){  //it's not if the list, push!
        any_pending_reports.push({ report: ns, report_type: type});
        storage.set({pendingReports: JSON.stringify(any_pending_reports)});
      }
    };

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
		  sendGET(URL,msg.ns, 
        function(response){ 
    			if(response.indexOf('ok') != -1){
            msg.ns = response.split(" ")[1];
    				if(con){
    					updateLocalConList(msg.ns,add);
    					if(localList[msg.ns]!=null){
                sendGET(avoidReportUrl,msg.ns,
                  function(response){
        						if(response.indexOf('ok')!=-1){
        							updateLocalList(msg.ns,false);
                      sendResponse({result: 'ok', ns: msg.ns});
                    }
        						else{
        							updateLocalConList(msg.ns,!add);
        							sendResponse({result: 'fail'});
                      performing=false;
        						}
                  },onTimeout);
    					}
              else
                sendResponse({result: 'ok', ns: msg.ns});
    				}
    				else{
    					updateLocalList(msg.ns,add);
    					if(localConList[msg.ns]!=null){
                sendGET(avoidConReportUrl,msg.ns,
                  function(response){
        						if(response.indexOf('ok')!=-1){
        							updateLocalConList(msg.ns,false);
                      sendResponse({result: 'ok', ns: msg.ns});
                    }
        						else{
        							updateLocalList(msg.ns,!add);
        							sendResponse({result: 'fail'});
                      performing=false;
        						}
                  },onTimeout);
    					}
              else
                sendResponse({result: 'ok', ns: msg.ns});
    				}
    			}
    			else{
    				sendResponse({result: 'fail'});
    			}
        },
        onTimeout);
		}
		performing=false;
	}
	return true;	//return true if sendResponse run after the function returns
}

