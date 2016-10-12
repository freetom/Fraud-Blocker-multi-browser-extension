function fetchBL(){
    try{
        if(synchronizing)
            return;
    	var request = new XMLHttpRequest();
        var now=getTimeNormalized();
        request.open("GET", blackListURL+'?lastUpdate='+blackListTimestamp, true);
        request.timeout = reqDefaultTimeout;
        request.onload = function () {
            var response = request.responseText;
            toAdd=response.split(' ')
            toAdd.pop() //remove last elemenet, always ''
            if(toAdd[0]!='list')
                return;
            for(i=1;i<toAdd.length;i++){
                blackList[toAdd[i]]=1;
            }
            if(toAdd.length>0){
                storage.set({black: JSON.stringify(blackList)});
                blackListTimestamp=now;
                storage.set({blackTimestamp: blackListTimestamp});

            }
        };
        request.send();
    }
    catch(ex){}
}

function fetchGL(){
    try{
        if(synchronizing)
            return;
        var request = new XMLHttpRequest();
        var now=getTimeNormalized();
        request.open("GET", greyListURL+'?lastUpdate='+greyListTimestamp, true);
        request.timeout = reqDefaultTimeout;
        request.onload = function () {
            var response = request.responseText;
            toAdd=response.split(' ')
            toAdd.pop() //remove last elemenet, always ''
            if(toAdd[0]!='list')
                return;
            for(i=1;i<toAdd.length;i+=3){
                greyList[toAdd[i]]={reports: toAdd[i+1], contro_reports: toAdd[i+2]};
            }
            if(toAdd.length>0){
                storage.set({grey: JSON.stringify(greyList)});
                greyListTimestamp=now;
                storage.set({greyTimestamp: greyListTimestamp});
            }
        };
        request.send();
    }
    catch(ex){}
}

function fetchWL(){
    try{
        if(synchronizing)
            return;
        var request = new XMLHttpRequest();
        var now=getTimeNormalized();
        request.open("GET", whiteListURL+'?lastUpdate='+whiteListTimestamp, true);
        request.timeout = reqDefaultTimeout;
        request.onload = function () {
            var response = request.responseText;
            toAdd=response.split(' ')
            toAdd.pop() //remove last elemenet, always ''
            if(toAdd[0]!='list')
                return;
            for(i=1;i<toAdd.length;i++){
                whiteList[toAdd[i]]=1;
            }
            if(toAdd.length>0){
                storage.set({white: JSON.stringify(whiteList)});
                whiteListTimestamp=now;
                storage.set({whiteTimestamp: whiteListTimestamp});
            }
        };
        request.send();
    }
    catch(ex){}
}

function fetchRevoked(){
    try{
        if(synchronizing)
            return;
        var request = new XMLHttpRequest();
        var now=getTimeNormalized();
        request.open("GET", revokedURL+'?lastUpdate='+revokedTimestamp, true);
        request.timeout = reqDefaultTimeout;
        request.onload = function () {
            var response = request.responseText;
            toRemove=response.split(' ')
            toRemove.pop() //remove last elemenet, always ''
            if(toRemove[0]!='list')
                return;
            for(i=1;i<toRemove.length;i++){
                if(whiteList[toRemove[i]]!=null)
                   delete whiteList[toRemove[i]]; 
            }
            if(toRemove.length>0){
                storage.set({white: JSON.stringify(whiteList)});
                revokedTimestamp=now;
                storage.set({revoked: revokedTimestamp});
            }
        };
        request.send();
    }
    catch(ex){}
}

