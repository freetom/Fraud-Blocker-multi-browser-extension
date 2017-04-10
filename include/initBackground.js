
var blackListURL= backendName+api+'blackList.php';
var greyListURL = backendName+api+'greyList.php';
var whiteListURL= backendName+api+'whiteList.php';
var revokedURL  = backendName+api+'revoked.php';
var subleasesURL= backendName+api+'subleases.php';

var quickstartURL = backendName+'quickstart.html';

var localList=null;
var localConList=null;

var blackList=null;
var blackListTimestamp=null;
var greyList=null;
var greyListTimestamp=null;
var whiteList=null;
var whiteListTimestamp=null;
var revokedTimestamp=null;
var subleasesList=null;
var subleasesListTimestamp=null;

var blackLastAttemptTimestamp=null;
var greyLastAttemptTimestamp=null;
var whiteLastAttemptTimestamp=null;
var revokedLastAttemptTimestamp=null;
var subleasesLastAttemptTimestamp=null;

var any_pending_reports=[];

var lastSyncTimestamp=null;
var synchronizing=false;

//res contains all the data saved on the storage
//it is used to init all the structures local to the background script/thread
function init(res){
	//if first boot, show quickstart page
  if(res.quickstart==null){
      storage.set({quickstart: '1'});
      chrome.tabs.create({ url:quickstartURL })
  }

  if(res.local==null){
      localList={};
      storage.set({local: localList});
  }
  else
      localList=parseObj(res.local);

  if(res.localCon==null){
      localConList={};
      storage.set({localCon: localConList});
  }
  else
      localConList=parseObj(res.localCon);

	if(res.black==null){
    	blackList={};
      storage.set({black: blackList});
  }
  else
  	blackList=parseObj(res.black);
  if(res.blackTimestamp==null){
      blackListTimestamp=timeZero;
      storage.set({blackTimestamp: blackListTimestamp});
  }
  else
      blackListTimestamp=res.blackTimestamp;
  if(res.blackLastAttempt==null){
      blackLastAttemptTimestamp=timeZero;
      storage.set({blackLastAttempt: blackLastAttemptTimestamp});
  }
  else
      blackLastAttemptTimestamp=res.blackLastAttempt;

  if(res.grey==null){
  	greyList={};
      storage.set({grey: greyList});
  }
  else
  	greyList=parseObj(res.grey);

  if(res.greyTimestamp==null){
      greyListTimestamp=timeZero;
      storage.set({greyTimestamp: greyListTimestamp});
  }
  else
      greyListTimestamp=res.greyTimestamp;
  if(res.greyLastAttempt==null){
      greyLastAttemptTimestamp=timeZero;
      storage.set({greyLastAttempt: greyLastAttemptTimestamp});
  }
  else
      greyLastAttemptTimestamp=res.greyLastAttempt;

  if(res.white==null){
      whiteList={};
      storage.set({white: whiteList});
  }
  else
      whiteList=parseObj(res.white);
  if(res.whiteTimestamp==null){
      whiteListTimestamp=timeZero;
      storage.set({whiteTimestamp:whiteListTimestamp});
  }
  else
      whiteListTimestamp=res.whiteTimestamp;
  if(res.whiteLastAttempt==null){
      whiteLastAttemptTimestamp=timeZero;
      storage.set({whiteLastAttempt: whiteLastAttemptTimestamp});
  }
  else
      whiteLastAttemptTimestamp=res.whiteLastAttempt;

  if(res.revoked==null){
      revokedTimestamp=timeZero;
      storage.set({revoked: revokedTimestamp});
  }
  else
      revokedTimestamp=res.revoked;
  if(res.revokedLastAttempt==null){
      revokedLastAttemptTimestamp=timeZero;
      storage.set({revokedLastAttempt: revokedLastAttemptTimestamp});
  }
  else
      revokedLastAttemptTimestamp=res.revokedLastAttempt;

  if(res.subleases==null){
      subleasesList={};
      storage.set({subleases: subleasesList});
  }
  else
      subleasesList=parseObj(res.subleases);
  if(res.subleasesTimestamp==null){
      subleasesListTimestamp=timeZero;
      storage.set({subleasesTimestamp:subleasesListTimestamp});
  }
  else
      subleasesListTimestamp=res.subleasesTimestamp;
  if(res.subleasesLastAttempt==null){
      subleasesLastAttemptTimestamp=timeZero;
      storage.set({subleasesLastAttempt: subleasesLastAttemptTimestamp});
  }
  else
      subleasesLastAttemptTimestamp=res.subleasesLastAttempt;

  if(res.lastSync==null){
      lastSyncTimestamp=getTimeNormalized();
      storage.set({lastSync:lastSyncTimestamp});
  }
  else
      lastSyncTimestamp=res.lastSync;

  if(res.pendingReports!=null){
      any_pending_reports=parseObj(res.pendingReports);
  }

  fetchBL();
  fetchWL();
  fetchGL();
  fetchRevoked();
  fetchSubleases();
  syncLists();

  setInterval(fetchBL,blackUpdateLapse);
  setInterval(fetchWL,whiteUpdateLapse);
  setInterval(fetchGL,greyUpdateLapse);
  setInterval(fetchRevoked,revokeUpdateLapse);
  setInterval(fetchSubleases,subleasesUpdateLapse);

  setInterval(syncLists,localSyncLapse);


  setInterval(pendingReports, pendingReportsLapse);
}

//reports failed are added to a queue and are sent here
//changes are propagated to the local data structures (do the same as in messaging.js)
function pendingReports(){
  if(any_pending_reports.length!==0){
    var pending_report=any_pending_reports.pop();
    any_pending_reports.push(pending_report);
    var type = pending_report.report_type;
    var url=(type==0)?reportUrl:(type==1)?conReportUrl:(type==2)?avoidReportUrl:(type==3)?avoidConReportUrl:-1;
    if(url==-1){    //practically impossible but just in case
      any_pending_reports.pop();
      storage.set({pendingReports: JSON.stringify(any_pending_reports)});
      return;
    }
    var request = new XMLHttpRequest();
    request.open("GET", url+'?ns='+pending_report.report, true);
    request.timeout = reqDefaultTimeout;
    request.onload = function () {
      var response = request.responseText;
      if(response.indexOf('ok')!=-1){
        var ns = response.split(' ')[1];
        if(type%2==0)
          updateLocalList(ns, (type==0)?true:false);
        else
          updateLocalConList(ns, (type==1)?true:false);
      }
      any_pending_reports.pop();  //even if server say error, we have to remove it or it will loop again.
      //short story long.. if the server catch the message and it fails is because the ns is in another list
      storage.set({pendingReports: JSON.stringify(any_pending_reports)});
    };
    request.ontimeout = function(){   };
    request.onerror = function(){  };
    request.send();
  }
}
