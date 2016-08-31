
var blackListURL= backendName+api+'blackList.php';
var greyListURL = backendName+api+'greyList.php';
var whiteListURL = backendName+api+'whiteList.php';
var revokedURL =  backendName+api+'revoked.php';

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

var lastSyncTimestamp=null;
var synchronizing=false;

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

    if(res.revoked==null){
        revokedTimestamp=timeZero;
        storage.set({revoked: revokedTimestamp});
    }
    else
        revokedTimestamp=res.revoked;

    if(res.lastSync==null){
        lastSyncTimestamp=getTimeNormalized();
        storage.set({lastSync:lastSyncTimestamp});
    }
    else
        lastSyncTimestamp=res.lastSync;

    fetchBL();
    fetchWL();
    fetchGL();
    fetchRevoked();
    syncLists();

    setInterval(fetchBL, 600000); //10 min
    setInterval(fetchWL,1200000); //20 min
    setInterval(fetchGL, 300000); //5 min
    setInterval(fetchRevoked,1800000);   //30 min
    
    setInterval(syncLists,   3600000);  //60 min
}

