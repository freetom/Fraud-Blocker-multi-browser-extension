function fetchBL(){
    try{
        if( strToDate(getTimeNormalized())-strToDate(blackLastAttemptTimestamp) > blackUpdateLapse ){
            if(synchronizing)
                return;
        	var request = new XMLHttpRequest();
            var now=getTimeNormalized();
            request.open("GET", blackListURL+'?lastUpdate='+blackListTimestamp, true);
            request.timeout = reqDefaultTimeout;
            request.onload = function () {
                var response = request.responseText;
                toAdd=response.split(' ');
                toAdd.pop() //remove last elemenet, always ''
                if(toAdd[0]!='list')
                    return;
                for(i=1;i<toAdd.length;i++){
                    blackList[toAdd[i]]=1;
                }
                if(toAdd.length>1){
                    storage.set({black: JSON.stringify(blackList)});
                    blackListTimestamp=now;
                    storage.set({blackTimestamp: blackListTimestamp});
                }
                storage.set({blackLastAttempt: now});
            };
            request.send();
        }
    }
    catch(ex){}
}

function fetchGL(){
    try{
        if( strToDate(getTimeNormalized())-strToDate(greyLastAttemptTimestamp) > greyUpdateLapse ){
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
                if(toAdd.length>1){
                    storage.set({grey: JSON.stringify(greyList)});
                    greyListTimestamp=now;
                    storage.set({greyTimestamp: greyListTimestamp});
                }
                storage.set({greyLastAttempt: now});
            };
            request.send();
        }
    }
    catch(ex){}
}

function fetchWL(){
    try{
        if( strToDate(getTimeNormalized())-strToDate(whiteLastAttemptTimestamp) > whiteUpdateLapse ){
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
                if(toAdd.length>1){
                    storage.set({white: JSON.stringify(whiteList)});
                    whiteListTimestamp=now;
                    storage.set({whiteTimestamp: whiteListTimestamp});
                }
                storage.set({whiteLastAttempt: now});
            };
            request.send();
        }
    }
    catch(ex){}
}

function fetchRevoked(){
    try{
        if( strToDate(getTimeNormalized())-strToDate(revokedLastAttemptTimestamp) > revokeUpdateLapse ){
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
                    if(subleasesList[toRemove[i]]!=null)
                        delete subleasesList[toRemove[i]];
                }
                if(toRemove.length>1){
                    storage.set({white: JSON.stringify(whiteList)});
                    revokedTimestamp=now;
                    storage.set({revoked: revokedTimestamp});
                }
                storage.set({revokedLastAttempt: now});
            };
            request.send();
        }
    }
    catch(ex){}
}

//update list of domains that provide subdomains as a service (e.g altervista)
function fetchSubleases(){
    try{
        if( strToDate(getTimeNormalized())-strToDate(subleasesLastAttemptTimestamp) > subleasesUpdateLapse ){
            if(synchronizing)
                return;
            var request = new XMLHttpRequest();
            var now=getTimeNormalized();
            request.open("GET", subleasesURL+'?lastUpdate='+subleasesListTimestamp, true);
            request.timeout = reqDefaultTimeout;
            request.onload = function () {
                var response = request.responseText;
                toAdd=response.split(' ')
                toAdd.pop() //remove last elemenet, always ''
                if(toAdd[0]!='list')
                    return;
                for(i=1;i<toAdd.length;i++){
                    subleasesList[toAdd[i]]=1;
                }
                if(toAdd.length>1){
                    storage.set({subleases: JSON.stringify(subleasesList)});
                    subleasesListTimestamp=now;
                    storage.set({subleasesTimestamp: subleasesListTimestamp});
                }
                storage.set({subleasesLastAttempt: now});
            };
            request.send();
        }
    }
    catch(ex){}
}
