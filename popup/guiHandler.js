function updateDiv(div, content){
  div=document.getElementById(div); 
  div.innerHTML=content;
}

function checkURL(msg){
  if(document.getElementById('white').style.display!='none')
    document.getElementById('white').style.display='none';
  if(document.getElementById('black').style.display!='none')
    document.getElementById('black').style.display='none';
  if(document.getElementById('grey').style.display!='none')
    document.getElementById('grey').style.display='none';
  if(msg.msg=='white'){
    setView('none','none','none');
    if(document.getElementById('white').style.display!='block')
      document.getElementById('white').style.display='block';
    return true;
  }
  else if(msg.msg=='black' || msg.msg=='ignored'){
    setView('none','none','none');
    if(document.getElementById('black').style.display!='block')
      document.getElementById('black').style.display='block';
    return true;
  }
  else if(msg.msg=='grey'){
    setView('none','none','none');
    document.getElementById("nReports").innerHTML=msg.nFraud;
    document.getElementById("nControReports").innerHTML=msg.nGood;
    if(localList[msg.ns]!=null){
      document.getElementById("fraudlent").style.borderColor='red';
      document.getElementById("non-fraudlent").style.borderColor='#060606';
    }
    else if(localConList[msg.ns]!=null){
      document.getElementById("fraudlent").style.borderColor='#0606060';
      document.getElementById("non-fraudlent").style.borderColor='red';
    }
    else{
      document.getElementById("fraudlent").style.borderColor='#060606';
      document.getElementById("non-fraudlent").style.borderColor='#060606';
    }
    if(document.getElementById('grey').style.display!='block')
      document.getElementById('grey').style.display='block';
    return true;
  }
  else{
    if(document.getElementById('white').style.display!='none')
      document.getElementById('white').style.display='none';
    if(document.getElementById('black').style.display!='none')
      document.getElementById('black').style.display='none';
    if(document.getElementById('grey').style.display!='none')
      document.getElementById('grey').style.display='none'; 
    return false;
  }
}

