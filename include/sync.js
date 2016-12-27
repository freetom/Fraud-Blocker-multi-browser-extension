function syncLists(){
	synchronizing=true;
	setTimeout(syncHelper,reqDefaultTimeout);	//wait so if the fetch functions are running they terminate
}

/*	Sync the lists with the following logic
 *	If a value is in whitelist then it can't be on blacklist or greylist
 *	If a value is in blacklist then it can't be in greylist
*/
const syncDelay=3600000*4;	//4 hours is good
function syncHelper(){
	//every 4 hours, sync lists
	if(strToDate(getTimeNormalized())-strToDate(lastSyncTimestamp)>syncDelay){
		try{
			for(var site in whiteList){
				if(blackList[site]!=null)
					delete blackList[site];
				if(greyList[site]!=null)
					delete greyList[site];
			}
			for(var site in blackList){
				if(greyList[site]!=null)
					delete greyList[site];
			}
			lastSyncTimestamp=getTimeNormalized();

			storage.set({black:JSON.stringify(blackList)});
			storage.set({grey:JSON.stringify(greyList)});
			storage.set({lastSync:lastSyncTimestamp});
		}
		catch(ex){}
	}
	synchronizing=false;
}
