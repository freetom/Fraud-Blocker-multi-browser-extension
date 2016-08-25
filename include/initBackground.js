var blackListURL= backendName+'blackList.php';
var greyListURL = backendName+'greyList.php';
var whiteListURL = backendName+'whiteList.php';
var revokedURL =  backendName+'revoked.php';

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

    setInterval(fetchBL,30000);
    setInterval(fetchWL,30000);
    setInterval(fetchGL,30000);
    setInterval(fetchRevoked,30000);
    
    setInterval(syncLists,60000);
}

