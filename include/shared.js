const backendName='https://fraudblocker.publicvm.com/';
const timeZero='1970-01-01 00:00:00';

var api='api/';

var reportUrl=backendName+api+'report.php';
var avoidReportUrl=backendName+api+'avoidReport.php';

var conReportUrl=backendName+api+'conReport.php';
var avoidConReportUrl=backendName+api+'avoidConReport.php';

var storage=chrome.storage.local;

var reqDefaultTimeout = 5000; // 5 sec

var pendingReportsLapse=300000;  //5 min
var greyUpdateLapse    =900000;  // 15 min
var blackUpdateLapse   =1800000; // 30 min
var whiteUpdateLapse   =3600000; // 1h
var revokeUpdateLapse  =3600000; // 1h
var localSyncLapse     =28800000;// 8h


/*  Given a url return the contained name server
*/
function extractNS(url){
  var i=0;
  var j=url.indexOf('/',0);
  var i=url.indexOf(':',0);
  if(j==-1) // url without any '/' return as is
    return url;
  else if(j+1==url.length)  // only one slash as last char
    return url.substring(0,url.length-1);
  else if(j!=i+1 && i==-1)  // no prot:// ... 
    return url.substring(0,j);
  
  j+=2; // skip '//'
  i=url.indexOf('/',j);
  if(i==-1)
    return url.substring(j);
  else
    return url.substring(j,i);
}

/*  Given a url return nameserver at a certain deepness
 *  example: abc.tomas.com,2  ->  tomas.com
 *  exmaple: https://abc.tomas.com/asd,2  ->  tomas.com
*/
function extractSubNS(ns,level){
  var i=ns.length;
  level--;
  while(i>0){
    if(ns[i]=='.'){
      if(level==0){
        i++;
        break;
      }
      else
        level--;
    }
    i--;
  }
  return ns.substring(i);
}

/* Return time in Europe/Rome Timezone in format yyyy-mm-dd hh:mm:ss
 * Used to have time synchronized with Server
*/
function getTimeNormalized(){
  const romeOffset=-60; // +1.00 hour
  const msInOneMin=60000;

  var d = new Date()
  var n = d.getTimezoneOffset()
  var t= d.getTime();
  
  if(n<0){
    t -= (-n+romeOffset)*msInOneMin;
  }
  else{
    t -= (n-romeOffset)*msInOneMin;
  }
  d=new Date(t);
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()+' '+d.getHours()+':'+d.getMinutes()+':'+d.getSeconds();
}

function parseObj(x){
  var y=null;
  
  try{
    y=JSON.parse(x);
  }
  catch(ex){  y={}; }

  return y;
}

//string to date conversion function
//string must be in format yyyy-mm-dd hh:mm:ss
function strToDate(x){
  y=x.split('-').join(' ').split(':').join(' ').split(' ');
  return new Date(y[0],y[1],y[2],y[3],y[4],y[5]);
}
