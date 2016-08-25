const backendName='https://fraudblocker.publicvm.com/';
const timeZero='1970-01-01 00:00:00';

var reportUrl=backendName+'report.php';
var avoidReportUrl=backendName+'avoidReport.php';

var conReportUrl=backendName+'conReport.php';
var avoidConReportUrl=backendName+'avoidConReport.php';

var storage=chrome.storage.local;

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

/* Return time in Europe/Rome Timezone in format yyyy-mm-dd hh:mm:ss
 * Used to have time synchronized with Server
*/
function getTimeNormalized(){
  //const romeOffset=-120; // +2.00 hours
  const romeOffset=240; //actual offset in minutes for server location (east coast)
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
